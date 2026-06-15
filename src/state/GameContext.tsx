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
  Language,
} from '@/types';
import { RewardedAdType } from '@/data/monetization';
import { createInitialState, normalizeGameState } from '@/game/saveGame';
import { clearGame, loadGameResult, saveGame } from '@/storage';
import { findProduct } from '@/data/products';
import { findEvent } from '@/data/events';
import {
  addInventory,
  bulkDiscountRate,
  clearanceUnitPrice,
  inventoryCapacity,
  inventoryUnits,
  removeInventoryUnits,
} from '@/game/economy';
import { applyEffect } from '@/game/randomEvents';
import { applyXp, checkAchievements, xpForLevel } from '@/game/progression';
import { ensureDailyMissions } from '@/game/missions';
import { findCashCheat, normalizeCheatCode } from '@/game/cheats';
import { buyUpgradeAction, hireWorkerAction, unlockLocationAction } from '@/game/businessActions';
import { ensureWeeklyGoals } from '@/game/weeklyGoals';
import { runDay } from '@/game/dayCycle';
import { StoryChapter } from '@/game/story';
import { dayPriceFor } from '@/game/marketPrices';
import { repayLoanAction, takeLoanAction } from '@/game/bank';
import { canPrestige, doPrestige } from '@/game/prestige';
import { cityBuyFactor, travelToCity } from '@/game/cities';
import { addSaturation, buyPriceImpact, saturationFor } from '@/game/marketImpact';
import { buyPropertyAction } from '@/game/property';
import { LESSON_XP, LESSONS } from '@/data/lessons';
import { claimRewardedAdReward, AdRewardClaimResult } from '@/game/adRewards';
import { showRewardedAd } from '@/services/adService';

interface EndDayOutcome {
  report: DailyReport;
  pendingEvent?: GameEvent;
  newlyUnlockedAchievements: string[];
  completedWeeklyGoals: { id: string; title: string; titleEn: string; rewardText: string; rewardTextEn: string }[];
  levelsGained: number;
  completedStoryChapter?: StoryChapter;
}

interface GameContextType {
  state: GameState;
  isLoaded: boolean;
  loadError?: 'corrupt_save' | 'read_failed';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string;
  language: Language;
  inventoryCap: number;
  inventoryUsed: number;
  buyProduct: (
    productId: string,
    qty: number,
    haggleDiscountPercent?: number,
  ) => { ok: boolean; reason?: string };
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
  takeLoan: (offerId: string) => { ok: boolean; reason?: string };
  repayLoan: (loanId: string) => { ok: boolean; reason?: string; paid?: number };
  prestige: () => { ok: boolean };
  exportSave: () => string;
  importSave: (json: string) => { ok: boolean; error?: 'invalid_json' };
  travelTo: (cityId: string) => { ok: boolean; reason?: string; lostUnits?: number };
  buyProperty: (id: string) => { ok: boolean; reason?: string };
  markLessonRead: (id: string) => { firstRead: boolean };
  switchLocation: (id: string) => void;
  setLanguage: (lang: Language) => void;
  setSound: (v: boolean) => void;
  setVibration: (v: boolean) => void;
  setBusinessName: (name: string) => void;
  markReportViewed: () => void;
  watchRewardedAd: (type: RewardedAdType) => Promise<AdRewardClaimResult>;
  applyCheatCode: (code: string) => { ok: boolean; message: string; messageEn: string };
  resetGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<GameContextType['loadError']>();
  const [saveStatus, setSaveStatus] = useState<GameContextType['saveStatus']>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGameResult().then((result) => {
      if (cancelled) return;
      if (result.state) {
        setState(normalizeGameState(result.state));
        setLastSavedAt(result.state.lastSavedAt);
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
      setSaveStatus('saving');
      saveGame(state).then((savedAt) => {
        if (savedAt) {
          setLastSavedAt(savedAt);
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      });
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setState((s) => ensureWeeklyGoals(ensureDailyMissions(s)));
  }, [isLoaded, state.day]);

  const buyProduct = useCallback(
    (productId: string, qty: number, haggleDiscountPercent = 0) => {
      const p = findProduct(productId);
      if (!p) return { ok: false, reason: 'not_found' };
      if (p.unlockLevel > state.level) return { ok: false, reason: 'not_unlocked' };
      const dayBuyPrice = dayPriceFor(p, state.day).buyPrice;
      const cityFactor = cityBuyFactor(state.currentCityId, p.category);
      const saturation = buyPriceImpact(saturationFor(state, productId));
      const quotedUnit = Math.round(dayBuyPrice * cityFactor * saturation);
      const bulk = bulkDiscountRate(qty);
      const haggle = Math.max(0, Math.min(15, haggleDiscountPercent)) / 100;
      const unitPrice = Math.max(1, Math.round(quotedUnit * (1 - bulk) * (1 - haggle)));
      const totalCost = unitPrice * qty;
      if (state.cash < totalCost) return { ok: false, reason: 'not_enough_cash' };
      const cap = inventoryCapacity(state);
      const used = inventoryUnits(state);
      if (used + qty > cap) return { ok: false, reason: 'capacity_full' };
      setState((s) => ({
        ...s,
        cash: s.cash - totalCost,
        inventory: addInventory(s.inventory, productId, qty, unitPrice),
        marketSaturation: addSaturation(s.marketSaturation, productId, qty),
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
      const daySellPrice = dayPriceFor(product, state.day).sellPrice;
      const unitPrice = clearanceUnitPrice(product, item.unitCost, daySellPrice);
      const cashGained = unitPrice * clearQty;
      const costBasis = item.unitCost * clearQty;
      const expectedValue = daySellPrice * clearQty;
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
    const result = runDay(state);
    setState(result.state);
    return {
      report: result.report,
      pendingEvent: result.pendingEvent,
      newlyUnlockedAchievements: result.newlyUnlockedAchievements,
      completedWeeklyGoals: result.completedWeeklyGoals,
      levelsGained: result.levelsGained,
      completedStoryChapter: result.completedStoryChapter,
    };
  }, [state]);

  const applyChoice = useCallback(
    (eventId: string, choiceId: string): { effectText: string; effectTextEn: string } => {
      const event = findEvent(eventId);
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

  const takeLoan = useCallback(
    (offerId: string) => {
      const outcome = takeLoanAction(state, offerId);
      if (outcome.result.ok) setState(outcome.state);
      return outcome.result;
    },
    [state],
  );

  const repayLoan = useCallback(
    (loanId: string) => {
      const outcome = repayLoanAction(state, loanId);
      if (outcome.result.ok) setState(outcome.state);
      return { ...outcome.result, paid: outcome.paid };
    },
    [state],
  );

  const travelTo = useCallback(
    (cityId: string) => {
      const outcome = travelToCity(state, cityId);
      if (!outcome.ok) return { ok: false, reason: outcome.reason };
      setState(outcome.state);
      return { ok: true, lostUnits: outcome.lostUnits };
    },
    [state],
  );

  const buyProperty = useCallback(
    (id: string) => {
      const outcome = buyPropertyAction(state, id);
      if (outcome.result.ok) setState(checkAchievements(outcome.state).state);
      return outcome.result;
    },
    [state],
  );

  const markLessonRead = useCallback(
    (id: string) => {
      if (state.readLessonIds.includes(id)) return { firstRead: false };
      if (!LESSONS.some((l) => l.id === id)) return { firstRead: false };
      setState((s) =>
        s.readLessonIds.includes(id)
          ? s
          : applyXp({ ...s, readLessonIds: [...s.readLessonIds, id] }, LESSON_XP),
      );
      return { firstRead: true };
    },
    [state],
  );

  const prestige = useCallback(() => {
    if (!canPrestige(state)) return { ok: false };
    setState(doPrestige(state));
    return { ok: true };
  }, [state]);

  const exportSave = useCallback(() => JSON.stringify(state), [state]);

  const importSave = useCallback((json: string): { ok: boolean; error?: 'invalid_json' } => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.cash !== 'number') {
        return { ok: false, error: 'invalid_json' };
      }
      setState(normalizeGameState(parsed));
      return { ok: true };
    } catch {
      return { ok: false, error: 'invalid_json' };
    }
  }, []);

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

  const markReportViewed = useCallback(() => {
    setState((s) => (
      s.tutorial.reportViewed
        ? s
        : { ...s, tutorial: { ...s.tutorial, reportViewed: true } }
    ));
  }, []);

  const watchRewardedAd = useCallback(
    async (type: RewardedAdType): Promise<AdRewardClaimResult> => {
      const adResult = await showRewardedAd(type);
      if (!adResult.ok || !adResult.rewardEarned) {
        return {
          ok: false,
          reason: 'not_eligible',
          message: 'Ad haijakamilika, reward haijatolewa.',
          messageEn: 'The ad was not completed, so no reward was granted.',
        };
      }

      const claim = claimRewardedAdReward(state, type);
      if (claim.result.ok) setState(claim.state);
      return claim.result;
    },
    [state],
  );

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
      saveStatus,
      lastSavedAt,
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
      takeLoan,
      repayLoan,
      prestige,
      exportSave,
      importSave,
      travelTo,
      buyProperty,
      markLessonRead,
      switchLocation,
      setLanguage,
      setSound,
      setVibration,
      setBusinessName,
      markReportViewed,
      watchRewardedAd,
      applyCheatCode,
      resetGame,
    }),
    [
      state,
      isLoaded,
      loadError,
      saveStatus,
      lastSavedAt,
      buyProduct,
      clearInventory,
      endDay,
      applyChoice,
      dismissEvent,
      buyUpgrade,
      hireWorker,
      unlockLocation,
      takeLoan,
      repayLoan,
      prestige,
      exportSave,
      importSave,
      travelTo,
      buyProperty,
      markLessonRead,
      switchLocation,
      setLanguage,
      setSound,
      setVibration,
      setBusinessName,
      markReportViewed,
      watchRewardedAd,
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
