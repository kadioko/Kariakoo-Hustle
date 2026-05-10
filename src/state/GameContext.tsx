import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DailyReport,
  EventChoice,
  GameEvent,
  GameState,
  InventoryItem,
  Language,
} from '@/types';
import { createInitialState, normalizeGameState } from '@/game/saveGame';
import { clearGame, loadGameResult, saveGame } from '@/storage';
import { findProduct } from '@/data/products';
import { EVENTS } from '@/data/events';
import {
  addInventory,
  calcDailyExpenses,
  clearanceUnitPrice,
  inventoryCapacity,
  inventoryUnits,
  removeInventoryUnits,
  settleDailyLoans,
} from '@/game/economy';
import {
  adviceForDay,
  reputationDeltaFromDay,
  simulateDay,
} from '@/game/salesSimulation';
import { applyEffect, rollEvent } from '@/game/randomEvents';
import { applyXp, checkAchievements, xpForLevel, xpFromDay } from '@/game/progression';
import { ensureDailyMissions, evaluateMissions, generateDailyMissions } from '@/game/missions';
import { findCashCheat, normalizeCheatCode } from '@/game/cheats';
import { buyUpgradeAction, hireWorkerAction, unlockLocationAction } from '@/game/businessActions';

interface EndDayOutcome {
  report: DailyReport;
  pendingEvent?: GameEvent;
  newlyUnlockedAchievements: string[];
}

interface GameContextType {
  state: GameState;
  isLoaded: boolean;
  loadError?: 'corrupt_save' | 'read_failed';
  language: Language;
  inventoryCap: number;
  inventoryUsed: number;
  buyProduct: (productId: string, qty: number) => { ok: boolean; reason?: string };
  clearInventory: (
    productId: string,
    qty: number,
  ) => { ok: boolean; reason?: string; cashGained?: number; profit?: number; discountLoss?: number };
  endDay: () => EndDayOutcome;
  applyChoice: (eventId: string, choiceId: string) => { effectText: string; effectTextEn: string };
  dismissEvent: () => void;
  buyUpgrade: (id: string) => { ok: boolean; reason?: string };
  hireWorker: (id: string) => { ok: boolean; reason?: string };
  unlockLocation: (id: string) => { ok: boolean; reason?: string };
  switchLocation: (id: string) => void;
  setLanguage: (lang: Language) => void;
  setSound: (v: boolean) => void;
  setVibration: (v: boolean) => void;
  setBusinessName: (name: string) => void;
  applyCheatCode: (code: string) => { ok: boolean; message: string; messageEn: string };
  resetGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<GameContextType['loadError']>();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGameResult().then((result) => {
      if (cancelled) return;
      if (result.state) {
        setState(normalizeGameState(result.state));
      }
      setLoadError(result.error);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!isLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveGame(state);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setState((s) => ensureDailyMissions(s));
  }, [isLoaded, state.day]);

  const buyProduct = useCallback(
    (productId: string, qty: number) => {
      const p = findProduct(productId);
      if (!p) return { ok: false, reason: 'not_found' };
      if (p.unlockLevel > state.level) return { ok: false, reason: 'not_unlocked' };
      const totalCost = p.buyPrice * qty;
      if (state.cash < totalCost) return { ok: false, reason: 'not_enough_cash' };
      const cap = inventoryCapacity(state);
      const used = inventoryUnits(state);
      if (used + qty > cap) return { ok: false, reason: 'capacity_full' };
      setState((s) => ({
        ...s,
        cash: s.cash - totalCost,
        inventory: addInventory(s.inventory, productId, qty, p.buyPrice),
      }));
      return { ok: true };
    },
    [state],
  );

  const clearInventory = useCallback(
    (productId: string, qty: number) => {
      const item = state.inventory.find((i) => i.productId === productId);
      const product = findProduct(productId);
      if (!item || !product) return { ok: false, reason: 'not_found' };
      if (qty <= 0) return { ok: false, reason: 'invalid_qty' };
      const clearQty = Math.min(qty, item.quantity);
      const unitPrice = clearanceUnitPrice(product, item.unitCost);
      const cashGained = unitPrice * clearQty;
      const costBasis = item.unitCost * clearQty;
      const expectedValue = product.sellPrice * clearQty;
      const profit = cashGained - costBasis;
      const discountLoss = Math.max(0, expectedValue - cashGained);

      setState((s) => {
        let next: GameState = {
          ...s,
          cash: s.cash + cashGained,
          inventory: removeInventoryUnits(s.inventory, productId, clearQty),
          totalRevenue: s.totalRevenue + cashGained,
          totalProfit: s.totalProfit + profit,
          totalClearanceRevenue: s.totalClearanceRevenue + cashGained,
          totalClearanceLoss: s.totalClearanceLoss + discountLoss,
        };
        next = applyXp(next, Math.max(1, Math.floor(cashGained / 15000)));
        const ach = checkAchievements(next);
        return ach.state;
      });

      return { ok: true, cashGained, profit, discountLoss };
    },
    [state],
  );

  const endDay = useCallback((): EndDayOutcome => {
    let working: GameState = state;

    const expenses = calcDailyExpenses(working);
    const outcome = simulateDay(working);

    const pendingEvent = rollEvent(working);

    let eventTitle: string | undefined;
    let eventTitleEn: string | undefined;
    let eventEffectText: string | undefined;
    let eventEffectTextEn: string | undefined;
    let eventCash = 0;
    let eventRep = 0;
    let eventInventory: InventoryItem[] | null = null;
    let eventLoan = pendingEvent?.effect?.loan;

    if (pendingEvent) {
      eventTitle = pendingEvent.title;
      eventTitleEn = pendingEvent.titleEn;
    }

    // Apply non-choice events immediately, choice events deferred
    if (pendingEvent && pendingEvent.type !== 'choice' && pendingEvent.effect) {
      const afterSalesState: GameState = { ...working, inventory: outcome.newInventory };
      const applied = applyEffect(afterSalesState, pendingEvent.effect, outcome.revenue);
      eventCash = applied.cashChange;
      eventRep = applied.reputationChange;
      eventInventory = applied.inventory;
      eventLoan = pendingEvent.effect.loan;
      eventEffectText = pendingEvent.description;
      eventEffectTextEn = pendingEvent.descriptionEn;
    } else if (pendingEvent && pendingEvent.type === 'choice') {
      eventEffectText = 'Uamuzi unasubiri. Chagua hatua ya kuchukua.';
      eventEffectTextEn = 'Decision pending. Choose what to do next.';
    }

    const grossProfit = outcome.revenue - outcome.cogs;
    const repChange = reputationDeltaFromDay(working, outcome) + eventRep;
    const netProfit = grossProfit - expenses.total + eventCash;
    const advice = adviceForDay(working, outcome, netProfit);

    const productSalesCount = { ...working.productSalesCount };
    outcome.perProduct.forEach((p) => {
      productSalesCount[p.productId] = (productSalesCount[p.productId] ?? 0) + p.sold;
    });

    let report: DailyReport = {
      day: working.day,
      revenue: outcome.revenue,
      cogs: outcome.cogs,
      grossProfit,
      expenses: expenses.total,
      expenseBreakdown: {
        rent: expenses.rent,
        transport: expenses.transport,
        workerSalary: expenses.workerSalary,
        storage: expenses.storage,
        loanPayment: expenses.loanPayment,
      },
      netProfit,
      unitsSold: outcome.unitsSold,
      returnedUnits: outcome.returnedUnits,
      qualityLoss: outcome.qualityLoss,
      unitsRemaining: outcome.unitsRemaining,
      reputationChange: repChange,
      bestSellerId: outcome.bestSellerId,
      worstSellerId: outcome.worstSellerId,
      eventTitle: eventTitle,
      eventTitleEn: eventTitleEn,
      eventEffectText: eventEffectText,
      eventEffectTextEn: eventEffectTextEn,
      advice: advice.sw,
      adviceEn: advice.en,
    };

    const missionEvaluation = evaluateMissions(working, report);
    report = { ...report, missionResults: missionEvaluation.missionResults };

    let next: GameState = {
      ...working,
      cash: Math.max(0, working.cash + outcome.revenue - expenses.total + eventCash),
      inventory: eventInventory ?? outcome.newInventory,
      day: working.day + 1,
      reputation: Math.max(-10, Math.min(100, working.reputation + repChange)),
      reports: [report, ...working.reports].slice(0, 30),
      totalRevenue: working.totalRevenue + outcome.revenue,
      totalExpenses: working.totalExpenses + expenses.total + Math.max(0, -eventCash),
      totalProfit: working.totalProfit + netProfit,
      totalQualityLoss: working.totalQualityLoss + outcome.qualityLoss,
      productSalesCount,
      hasMadeFirstSale: working.hasMadeFirstSale || outcome.unitsSold > 0,
      pendingEventId:
        pendingEvent && pendingEvent.type === 'choice' ? pendingEvent.id : undefined,
    };

    next = {
      ...next,
      cash: Math.max(0, next.cash + (missionEvaluation.state.cash - working.cash)),
      xp: missionEvaluation.state.xp,
      reputation: Math.max(-10, Math.min(100, next.reputation + (missionEvaluation.state.reputation - working.reputation))),
      completedMissionIds: missionEvaluation.state.completedMissionIds,
    };

    next = settleDailyLoans(next);

    if (eventLoan && pendingEvent && pendingEvent.type !== 'choice') {
      next = {
        ...next,
        loans: [
          ...next.loans,
          {
            id: `${pendingEvent.id}_${working.day}`,
            principal: eventLoan.principal,
            remainingBalance: eventLoan.amountDue,
            dailyPayment: Math.ceil(eventLoan.amountDue / eventLoan.termDays),
            daysRemaining: eventLoan.termDays,
            sourceTitle: pendingEvent.title,
            sourceTitleEn: pendingEvent.titleEn,
          },
        ],
      };
    }

    next = applyXp(next, xpFromDay(outcome.revenue, netProfit));
    const ach = checkAchievements(next);
    next = ach.state;
    next = { ...next, missions: generateDailyMissions(next.day, next.level) };

    setState(next);

    return {
      report,
      pendingEvent: pendingEvent && pendingEvent.type === 'choice' ? pendingEvent : undefined,
      newlyUnlockedAchievements: ach.newlyUnlocked,
    };
  }, [state]);

  const applyChoice = useCallback(
    (eventId: string, choiceId: string): { effectText: string; effectTextEn: string } => {
      const event = EVENTS.find((e: GameEvent) => e.id === eventId);
      const choice: EventChoice | undefined = event?.choices?.find(
        (c: EventChoice) => c.id === choiceId,
      );
      if (!event || !choice) return { effectText: '', effectTextEn: '' };

      setState((s) => {
        const applied = applyEffect(s, choice.effect, s.cash);
        const loan = choice.effect.loan;
        let next: GameState = {
          ...s,
          cash: Math.max(0, s.cash + applied.cashChange),
          reputation: Math.max(-10, Math.min(100, s.reputation + applied.reputationChange)),
          inventory: applied.inventory,
          loans: loan
            ? [
                ...s.loans,
                {
                  id: `${event.id}_${choice.id}_${s.day}`,
                  principal: loan.principal,
                  remainingBalance: loan.amountDue,
                  dailyPayment: Math.ceil(loan.amountDue / loan.termDays),
                  daysRemaining: loan.termDays,
                  sourceTitle: event.title,
                  sourceTitleEn: event.titleEn,
                },
              ]
            : s.loans,
          reports: s.reports.map((r, index) =>
            index === 0
              ? {
                  ...r,
                  eventTitle: event.title,
                  eventTitleEn: event.titleEn,
                  eventEffectText: choice.effectText,
                  eventEffectTextEn: choice.effectTextEn,
                }
              : r,
          ),
          pendingEventId: undefined,
        };
        const ach = checkAchievements(next);
        return ach.state;
      });

      return { effectText: choice.effectText, effectTextEn: choice.effectTextEn };
    },
    [],
  );

  const dismissEvent = useCallback(() => {
    setState((s) => ({ ...s, pendingEventId: undefined }));
  }, []);

  const buyUpgrade = useCallback(
    (id: string) => {
      const outcome = buyUpgradeAction(state, id);
      if (outcome.result.ok) setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const hireWorker = useCallback(
    (id: string) => {
      const outcome = hireWorkerAction(state, id);
      if (outcome.result.ok) setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const unlockLocation = useCallback(
    (id: string) => {
      const outcome = unlockLocationAction(state, id);
      if (outcome.result.ok) setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const switchLocation = useCallback((id: string) => {
    setState((s) => {
      if (!s.locations.includes(id)) return s;
      return { ...s, currentLocationId: id };
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState((s) => ({ ...s, settings: { ...s.settings, language: lang } }));
  }, []);

  const setSound = useCallback((v: boolean) => {
    setState((s) => ({ ...s, settings: { ...s.settings, sound: v } }));
  }, []);

  const setVibration = useCallback((v: boolean) => {
    setState((s) => ({ ...s, settings: { ...s.settings, vibration: v } }));
  }, []);

  const setBusinessName = useCallback((name: string) => {
    setState((s) => ({ ...s, businessName: name }));
  }, []);

  const applyCheatCode = useCallback((rawCode: string) => {
    const code = normalizeCheatCode(rawCode);
    const success = (message: string, messageEn: string) => ({ ok: true, message, messageEn });
    const cashCheat = findCashCheat(code);

    if (cashCheat) {
      setState((s) => ({ ...s, cash: s.cash + cashCheat.amount }));
      return success(cashCheat.message, cashCheat.messageEn);
    }

    switch (code) {
      case 'SIFANJEMA':
        setState((s) => ({ ...s, reputation: Math.min(100, s.reputation + 10) }));
        return success('Sifa imepanda kwa pointi 10.', 'Reputation increased by 10 points.');
      case 'LEVELUP':
        setState((s) => checkAchievements(applyXp(s, xpForLevel(s.level))).state);
        return success('Level imepanda. Kariakoo inakutambua.', 'Level increased. Kariakoo knows your name.');
      case 'MZIGOBOOST':
        setState((s) => ({
          ...s,
          inventory: addInventory(
            addInventory(addInventory(s.inventory, 'phone_case', 5, 3000), 'charger', 4, 6000),
            'earphones',
            4,
            7000,
          ),
        }));
        return success('Starter stock imeongezwa kwenye inventory.', 'Starter stock added to inventory.');
      case 'FUTADENI':
        setState((s) => ({ ...s, loans: [] }));
        return success('Madeni yote yamefutwa.', 'All active loans have been cleared.');
      default:
        return {
          ok: false,
          message: 'Code haijatambulika. Hakikisha umeandika vizuri.',
          messageEn: 'Unknown code. Check the spelling and try again.',
        };
    }
  }, []);

  const resetGame = useCallback(async () => {
    await clearGame();
    setState(createInitialState());
    setLoadError(undefined);
  }, []);

  const value = useMemo<GameContextType>(
    () => ({
      state,
      isLoaded,
      loadError,
      language: state.settings.language,
      inventoryCap: inventoryCapacity(state),
      inventoryUsed: inventoryUnits(state),
      buyProduct,
      clearInventory,
      endDay,
      applyChoice,
      dismissEvent,
      buyUpgrade,
      hireWorker,
      unlockLocation,
      switchLocation,
      setLanguage,
      setSound,
      setVibration,
      setBusinessName,
      applyCheatCode,
      resetGame,
    }),
    [
      state,
      isLoaded,
      loadError,
      buyProduct,
      clearInventory,
      endDay,
      applyChoice,
      dismissEvent,
      buyUpgrade,
      hireWorker,
      unlockLocation,
      switchLocation,
      setLanguage,
      setSound,
      setVibration,
      setBusinessName,
      applyCheatCode,
      resetGame,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
