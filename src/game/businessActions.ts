import { findLocation } from '@/data/locations';
import { UPGRADES } from '@/data/upgrades';
import { WORKERS } from '@/data/workers';
import { GameState } from '@/types';
import { checkAchievements } from './progression';

export type BusinessActionResult = { ok: boolean; reason?: string };
export type BusinessActionOutcome = { state: GameState; result: BusinessActionResult };

export function buyUpgradeAction(state: GameState, id: string): BusinessActionOutcome {
  const upgrade = UPGRADES.find((x) => x.id === id);
  if (!upgrade) return { state, result: { ok: false, reason: 'not_found' } };
  if (state.upgrades.includes(id)) return { state, result: { ok: false, reason: 'already_owned' } };
  if (state.level < upgrade.unlockLevel) return { state, result: { ok: false, reason: 'not_unlocked' } };
  if (state.cash < upgrade.cost) return { state, result: { ok: false, reason: 'not_enough_cash' } };

  const next: GameState = {
    ...state,
    cash: state.cash - upgrade.cost,
    upgrades: [...state.upgrades, id],
    reputation: Math.min(100, state.reputation + (upgrade.effects.reputationBonus ?? 0)),
  };

  return { state: checkAchievements(next).state, result: { ok: true } };
}

export function hireWorkerAction(state: GameState, id: string): BusinessActionOutcome {
  const worker = WORKERS.find((x) => x.id === id);
  if (!worker) return { state, result: { ok: false, reason: 'not_found' } };
  if (state.workers.includes(worker.id)) return { state, result: { ok: false, reason: 'already_hired' } };
  if (state.level < worker.unlockLevel) return { state, result: { ok: false, reason: 'not_unlocked' } };
  if (state.cash < worker.salary) return { state, result: { ok: false, reason: 'not_enough_cash' } };

  const next: GameState = {
    ...state,
    cash: state.cash - worker.salary,
    workers: [...state.workers, worker.id],
  };

  return { state: checkAchievements(next).state, result: { ok: true } };
}

export function unlockLocationAction(state: GameState, id: string): BusinessActionOutcome {
  const location = findLocation(id);
  if (!location) return { state, result: { ok: false, reason: 'not_found' } };
  if (state.locations.includes(id)) return { state, result: { ok: false, reason: 'already_unlocked' } };
  if (state.cash < location.unlockCost) return { state, result: { ok: false, reason: 'not_enough_cash' } };

  const next: GameState = {
    ...state,
    cash: state.cash - location.unlockCost,
    locations: [...state.locations, id],
    currentLocationId: id,
  };

  return { state: checkAchievements(next).state, result: { ok: true } };
}
