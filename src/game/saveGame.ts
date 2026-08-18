import { GameState } from '@/types';
import { generateDailyMissions } from './missions';
import { generateWeeklyGoals } from './weeklyGoals';
import { STARTING_CASH } from './economy';

export const SAVE_VERSION = 13;

/** Returns a finite, safe number or the fallback (guards against NaN/Infinity in corrupt saves). */
function safeNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function createInitialState(): GameState {
  return {
    saveVersion: SAVE_VERSION,
    businessName: 'Hustle ya Kariakoo',
    cash: STARTING_CASH,
    day: 1,
    level: 1,
    xp: 0,
    reputation: 0,
    inventory: [],
    upgrades: [],
    workers: [],
    loans: [],
    missions: generateDailyMissions(1, 1),
    completedMissionIds: [],
    missionStreak: 0,
    bestMissionStreak: 0,
    weeklyGoals: generateWeeklyGoals(1, 1, 0),
    completedWeeklyGoalIds: [],
    tutorial: { reportViewed: false },
    locations: ['kariakoo_table'],
    currentLocationId: 'kariakoo_table',
    achievements: [],
    reports: [],
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalQualityLoss: 0,
    totalClearanceRevenue: 0,
    totalClearanceLoss: 0,
    productSalesCount: {},
    streak: 0,
    bestStreak: 0,
    legacyLevel: 0,
    workerHiredOnDay: {},
    currentCityId: 'dar',
    marketSaturation: {},
    supplierTrust: 0,
    ownedProperties: [],
    completedStoryIds: [],
    readLessonIds: [],
    adRewardClaims: [],
    deliverySpeedUntilDay: 0,
    adRecoveryTotal: 0,
    settings: {
      language: 'sw',
      sound: true,
      vibration: true,
    },
    hasMadeFirstSale: false,
  };
}

export function normalizeGameState(raw: Partial<GameState> | null | undefined): GameState {
  const initial = createInitialState();
  if (!raw) return initial;

  return {
    ...initial,
    ...raw,
    saveVersion: SAVE_VERSION,
    businessName: raw.businessName?.trim() || initial.businessName,
    cash: Math.max(0, safeNumber(raw.cash, initial.cash)),
    day: Math.max(1, Math.round(safeNumber(raw.day, initial.day))),
    level: Math.max(1, Math.round(safeNumber(raw.level, initial.level))),
    xp: Math.max(0, safeNumber(raw.xp, initial.xp)),
    reputation: Math.max(-10, Math.min(100, safeNumber(raw.reputation, initial.reputation))),
    totalRevenue: safeNumber(raw.totalRevenue, initial.totalRevenue),
    totalExpenses: safeNumber(raw.totalExpenses, initial.totalExpenses),
    totalProfit: safeNumber(raw.totalProfit, initial.totalProfit),
    streak: Math.max(0, Math.round(safeNumber(raw.streak, 0))),
    bestStreak: Math.max(0, Math.round(safeNumber(raw.bestStreak, 0))),
    legacyLevel: Math.max(0, Math.round(safeNumber(raw.legacyLevel, 0))),
    workerHiredOnDay:
      raw.workerHiredOnDay && typeof raw.workerHiredOnDay === 'object'
        ? raw.workerHiredOnDay
        : initial.workerHiredOnDay,
    currentCityId: typeof raw.currentCityId === 'string' && raw.currentCityId
      ? raw.currentCityId
      : initial.currentCityId,
    marketSaturation:
      raw.marketSaturation && typeof raw.marketSaturation === 'object'
        ? raw.marketSaturation
        : initial.marketSaturation,
    supplierTrust: Math.max(0, Math.min(100, Math.round(safeNumber(raw.supplierTrust, initial.supplierTrust)))),
    ownedProperties: Array.isArray(raw.ownedProperties)
      ? raw.ownedProperties
      : initial.ownedProperties,
    completedStoryIds: Array.isArray(raw.completedStoryIds)
      ? raw.completedStoryIds
      : initial.completedStoryIds,
    readLessonIds: Array.isArray(raw.readLessonIds)
      ? raw.readLessonIds
      : initial.readLessonIds,
    adRewardClaims: Array.isArray(raw.adRewardClaims)
      ? raw.adRewardClaims
      : initial.adRewardClaims,
    lastMarketInsiderTip:
      raw.lastMarketInsiderTip && typeof raw.lastMarketInsiderTip === 'object'
        ? raw.lastMarketInsiderTip
        : initial.lastMarketInsiderTip,
    deliverySpeedUntilDay: Math.max(0, Math.round(safeNumber(raw.deliverySpeedUntilDay, 0))),
    adRecoveryTotal: Math.max(0, safeNumber(raw.adRecoveryTotal, 0)),
    inventory: Array.isArray(raw.inventory)
      ? raw.inventory.map(({ qualityReturnMultiplier, ...item }) => {
          const quality = safeNumber(qualityReturnMultiplier, 1);
          return Math.abs(quality - 1) > 0.01
            ? { ...item, qualityReturnMultiplier: Math.max(0.4, Math.min(2, quality)) }
            : item;
        })
      : initial.inventory,
    upgrades: Array.isArray(raw.upgrades) ? raw.upgrades : initial.upgrades,
    workers: Array.isArray(raw.workers) ? raw.workers : initial.workers,
    loans: Array.isArray(raw.loans) ? raw.loans : initial.loans,
    missions:
      Array.isArray(raw.missions) && raw.missions.length > 0
        ? raw.missions
        : generateDailyMissions(raw.day ?? initial.day, raw.level ?? initial.level),
    completedMissionIds: Array.isArray(raw.completedMissionIds)
      ? raw.completedMissionIds
      : initial.completedMissionIds,
    missionStreak: Math.max(0, Math.round(safeNumber(raw.missionStreak, 0))),
    bestMissionStreak: Math.max(0, Math.round(safeNumber(raw.bestMissionStreak, 0))),
    weeklyGoals:
      Array.isArray(raw.weeklyGoals) && raw.weeklyGoals.length > 0
        ? raw.weeklyGoals
        : generateWeeklyGoals(Math.floor(((raw.day ?? initial.day) - 1) / 7) * 7 + 1, raw.level ?? initial.level, Array.isArray(raw.upgrades) ? raw.upgrades.length : 0),
    completedWeeklyGoalIds: Array.isArray(raw.completedWeeklyGoalIds)
      ? raw.completedWeeklyGoalIds
      : initial.completedWeeklyGoalIds,
    tutorial: {
      ...initial.tutorial,
      ...(raw.tutorial ?? {}),
    },
    locations:
      Array.isArray(raw.locations) && raw.locations.length > 0
        ? raw.locations
        : initial.locations,
    achievements: Array.isArray(raw.achievements)
      ? raw.achievements
      : initial.achievements,
    reports: Array.isArray(raw.reports) ? raw.reports : initial.reports,
    totalQualityLoss:
      typeof raw.totalQualityLoss === 'number'
        ? raw.totalQualityLoss
        : initial.totalQualityLoss,
    totalClearanceRevenue:
      typeof raw.totalClearanceRevenue === 'number'
        ? raw.totalClearanceRevenue
        : initial.totalClearanceRevenue,
    totalClearanceLoss:
      typeof raw.totalClearanceLoss === 'number'
        ? raw.totalClearanceLoss
        : initial.totalClearanceLoss,
    productSalesCount:
      raw.productSalesCount && typeof raw.productSalesCount === 'object'
        ? raw.productSalesCount
        : initial.productSalesCount,
    settings: {
      ...initial.settings,
      ...(raw.settings ?? {}),
    },
  };
}
