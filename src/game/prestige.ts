import { GameState } from '@/types';
import { createInitialState } from './saveGame';
import { netWorth, STARTING_CASH } from './economy';

// Prestige: "Mtaji wa Ukoo" (Family Capital).
// Reaching the net worth target lets you restart with a permanent
// sales bonus and bigger starting capital. Achievements and best
// streak survive; everything else resets.

export const PRESTIGE_NET_WORTH = 10_000_000;

/** Permanent sales boost per legacy level (applied in the sales sim). */
export const LEGACY_SALES_BOOST_PER_LEVEL = 0.1;

/** Starting cash grows +50% per legacy level. */
export function legacyStartingCash(legacyLevel: number): number {
  return Math.round(STARTING_CASH * (1 + legacyLevel * 0.5));
}

export function legacySalesBoost(legacyLevel: number): number {
  return legacyLevel * LEGACY_SALES_BOOST_PER_LEVEL;
}

export function canPrestige(state: GameState): boolean {
  return netWorth(state) >= PRESTIGE_NET_WORTH;
}

export function prestigeProgress(state: GameState): number {
  return Math.min(1, netWorth(state) / PRESTIGE_NET_WORTH);
}

/** Restart the business, keeping legacy, achievements, settings, and records. */
export function doPrestige(state: GameState): GameState {
  if (!canPrestige(state)) return state;
  const legacyLevel = state.legacyLevel + 1;
  const fresh = createInitialState();
  return {
    ...fresh,
    legacyLevel,
    cash: legacyStartingCash(legacyLevel),
    businessName: state.businessName,
    achievements: state.achievements,
    bestStreak: state.bestStreak,
    settings: state.settings,
    completedStoryIds: state.completedStoryIds, // the story doesn't replay
    readLessonIds: state.readLessonIds,
    tutorial: { reportViewed: true }, // veteran: skip the tutorial
  };
}
