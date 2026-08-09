import { DailyReport, GameEvent, GameState, InventoryItem } from '@/types';
import { calcDailyExpenses, settleDailyLoans } from './economy';
import {
  adviceForDay,
  reputationDeltaFromDay,
  SalesOutcome,
  simulateDay,
} from './salesSimulation';
import { applyEffect, rollEvent } from './randomEvents';
import { applyXp, checkAchievements, xpFromDay } from './progression';
import { evaluateMissions, generateDailyMissions } from './missions';
import { ensureWeeklyGoals, evaluateWeeklyGoals } from './weeklyGoals';
import { buildReportInsights } from './reportInsights';
import { nextStreak, streakBonusCash } from './streaks';
import { propertyDailyIncome } from './property';
import { decaySaturation } from './marketImpact';
import { evaluateStory, StoryChapter } from './story';
import { rollRivalEvent } from './rivals';
import { SellingStrategy } from './sellingStrategy';

/** Default event roll: rivals get first shot, then the streets. */
function defaultRollEvent(state: GameState): GameEvent | undefined {
  return rollRivalEvent(state) ?? rollEvent(state);
}

export interface DayCycleOptions {
  /** Override event rolling (pass () => undefined to disable events in tests) */
  rollEventFn?: (state: GameState) => GameEvent | undefined;
  /** Override the sales simulation (for deterministic tests) */
  simulateFn?: (state: GameState) => SalesOutcome;
  strategy?: SellingStrategy;
}

export interface DayCycleResult {
  state: GameState;
  report: DailyReport;
  pendingEvent?: GameEvent;
  newlyUnlockedAchievements: string[];
  completedWeeklyGoals: {
    id: string;
    title: string;
    titleEn: string;
    rewardText: string;
    rewardTextEn: string;
  }[];
  levelsGained: number;
  completedStoryChapter?: StoryChapter;
}

/**
 * Runs one full business day as a pure state transition:
 * sales simulation → event roll → P&L report → missions → loans →
 * weekly goals → XP/levels → achievements → next day's missions.
 */
export function runDay(working: GameState, opts: DayCycleOptions = {}): DayCycleResult {
  const expenses = calcDailyExpenses(working);
  const outcome = opts.simulateFn
    ? opts.simulateFn(working)
    : simulateDay(working, opts.strategy ?? 'balanced');
  const pendingEvent = (opts.rollEventFn ?? defaultRollEvent)(working);
  const propertyIncome = propertyDailyIncome(working);

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
  const netProfit = grossProfit - expenses.total + eventCash + propertyIncome;
  const advice = adviceForDay(working, outcome, netProfit);

  // Profit streak: consecutive profitable days earn a bonus
  const streak = nextStreak(working.streak, netProfit);
  const streakBonus = streakBonusCash(streak, netProfit);

  const productSalesCount = { ...working.productSalesCount };
  outcome.perProduct.forEach((p) => {
    productSalesCount[p.productId] = (productSalesCount[p.productId] ?? 0) + p.sold;
  });

  let report: DailyReport = {
    day: working.day,
    strategy: opts.strategy ?? 'balanced',
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
    salesBreakdown: outcome.perProduct,
    ...buildReportInsights(working, {
      day: working.day,
      revenue: outcome.revenue,
      cogs: outcome.cogs,
      grossProfit,
      expenses: expenses.total,
      netProfit,
      unitsSold: outcome.unitsSold,
      returnedUnits: outcome.returnedUnits,
      qualityLoss: outcome.qualityLoss,
      unitsRemaining: outcome.unitsRemaining,
      reputationChange: repChange,
      bestSellerId: outcome.bestSellerId,
      worstSellerId: outcome.worstSellerId,
      advice: advice.sw,
      adviceEn: advice.en,
    }),
    eventTitle,
    eventTitleEn,
    eventEffectText,
    eventEffectTextEn,
    streak,
    streakBonus,
    propertyIncome,
    advice: advice.sw,
    adviceEn: advice.en,
  };

  const missionEvaluation = evaluateMissions(working, report);
  report = {
    ...report,
    missionResults: missionEvaluation.missionResults,
    missionStreak: missionEvaluation.state.missionStreak,
    missionStreakBonus: missionEvaluation.missionStreakBonus,
  };

  let next: GameState = {
    ...working,
    cash: Math.max(0, working.cash + outcome.revenue - expenses.total + eventCash + streakBonus + propertyIncome),
    inventory: eventInventory ?? outcome.newInventory,
    day: working.day + 1,
    marketSaturation: decaySaturation(working.marketSaturation),
    streak,
    bestStreak: Math.max(working.bestStreak, streak),
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
    reputation: Math.max(
      -10,
      Math.min(100, next.reputation + (missionEvaluation.state.reputation - working.reputation)),
    ),
    completedMissionIds: missionEvaluation.state.completedMissionIds,
    missionStreak: missionEvaluation.state.missionStreak,
    bestMissionStreak: missionEvaluation.state.bestMissionStreak,
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

  const weeklyEvaluation = evaluateWeeklyGoals(next);
  next = weeklyEvaluation.state;

  next = applyXp(next, xpFromDay(outcome.revenue, netProfit));

  // Story progression
  const storyEvaluation = evaluateStory(next);
  next = applyXp(storyEvaluation.state, 0); // settle any level-up from story XP

  const ach = checkAchievements(next);
  next = ach.state;
  next = ensureWeeklyGoals({ ...next, missions: generateDailyMissions(next.day, next.level) });

  return {
    state: next,
    report,
    pendingEvent: pendingEvent && pendingEvent.type === 'choice' ? pendingEvent : undefined,
    newlyUnlockedAchievements: ach.newlyUnlocked,
    completedWeeklyGoals: weeklyEvaluation.completed,
    levelsGained: next.level - working.level,
    completedStoryChapter: storyEvaluation.completedChapter,
  };
}
