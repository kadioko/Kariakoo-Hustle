import { GameState } from '@/types';
import { generateDailyMissions } from './missions';
import { generateWeeklyGoals } from './weeklyGoals';
import { STARTING_CASH } from './economy';

export const SAVE_VERSION = 6;

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
    inventory: Array.isArray(raw.inventory) ? raw.inventory : initial.inventory,
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
