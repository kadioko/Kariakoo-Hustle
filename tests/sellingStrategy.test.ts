import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '@/game/saveGame';
import { addInventory } from '@/game/economy';
import { runDay } from '@/game/dayCycle';
import { SalesOutcome } from '@/game/salesSimulation';

function stateWithStock() {
  const state = createInitialState();
  return { ...state, inventory: addInventory([], 'phone_case', 20, 3000) };
}

function fixedSales(state: ReturnType<typeof stateWithStock>): SalesOutcome {
  return {
    newInventory: [], revenue: 50000, cogs: 30000, unitsSold: 10,
    returnedUnits: 0, qualityLoss: 0, unitsRemaining: 0,
    bestSellerId: 'phone_case', perProduct: [{ productId: 'phone_case', sold: 10, revenue: 50000 }],
  };
}

test('day reports record the chosen selling strategy', () => {
  const result = runDay(stateWithStock(), { strategy: 'aggressive', simulateFn: fixedSales, rollEventFn: () => undefined });
  assert.equal(result.report.strategy, 'aggressive');
});

test('legacy callers still use balanced strategy', () => {
  const result = runDay(stateWithStock(), { simulateFn: fixedSales, rollEventFn: () => undefined });
  assert.equal(result.report.strategy, 'balanced');
});
