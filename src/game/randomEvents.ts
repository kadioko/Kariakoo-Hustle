import { EventEffect, GameEvent, GameState, InventoryItem } from '@/types';
import { EVENTS } from '@/data/events';
import { UPGRADES } from '@/data/upgrades';
import { WORKERS } from '@/data/workers';

const NO_EVENT_CHANCE = 0.4;

export function rollEvent(state: GameState): GameEvent | undefined {
  if (Math.random() < NO_EVENT_CHANCE) return undefined;
  const eligible = EVENTS.filter((e) => (e.minLevel ?? 1) <= state.level);
  if (eligible.length === 0) return undefined;

  const totalP = eligible.reduce((s, e) => s + e.probability, 0);
  let r = Math.random() * totalP;
  for (const e of eligible) {
    r -= e.probability;
    if (r <= 0) return e;
  }
  return eligible[eligible.length - 1];
}

function eventLossReduction(state: GameState): number {
  let r = 0;
  state.upgrades.forEach((id) => {
    const u = UPGRADES.find((x) => x.id === id);
    r += u?.effects.eventLossReductionPercent ?? 0;
  });
  state.workers.forEach((id) => {
    const w = WORKERS.find((x) => x.id === id);
    r += w?.effects.eventLossReductionPercent ?? 0;
  });
  return Math.min(0.7, r);
}

export interface AppliedEvent {
  cashChange: number;
  reputationChange: number;
  inventory: InventoryItem[];
}

export function applyEffect(
  state: GameState,
  effect: EventEffect,
  baseRevenue: number,
): AppliedEvent {
  const reduction = eventLossReduction(state);
  let cashChange = 0;

  if (effect.cash !== undefined) {
    const v = effect.cash;
    cashChange += v < 0 ? Math.round(v * (1 - reduction)) : v;
  }
  if (effect.cashPercent !== undefined) {
    const v = Math.round(baseRevenue * effect.cashPercent);
    cashChange += v < 0 ? Math.round(v * (1 - reduction)) : v;
  }

  const reputationChange = effect.reputation ?? 0;

  let inventory = state.inventory;
  if (effect.inventoryLossPercent && inventory.length > 0) {
    const lossPct = effect.inventoryLossPercent * (1 - reduction);
    inventory = inventory.map((i) => ({
      ...i,
      quantity: Math.max(0, Math.floor(i.quantity * (1 - lossPct))),
    })).filter((i) => i.quantity > 0);
  }

  return { cashChange, reputationChange, inventory };
}
