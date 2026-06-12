import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runDay } from '@/game/dayCycle';
import { createInitialState } from '@/game/saveGame';
import { addInventory } from '@/game/economy';
import { GameState } from '@/types';
import { SalesOutcome } from '@/game/salesSimulation';

const noEvents = () => undefined;

function stateWithStock(): GameState {
  const s = createInitialState();
  return { ...s, inventory: addInventory(s.inventory, 'phone_case', 10, 3000) };
}

function fixedOutcome(state: GameState, revenue: number): SalesOutcome {
  return {
    newInventory: [],
    revenue,
    cogs: 30000,
    unitsSold: 10,
    returnedUnits: 0,
    qualityLoss: 0,
    unitsRemaining: 0,
    bestSellerId: 'phone_case',
    perProduct: [{ productId: 'phone_case', sold: 10, revenue }],
  };
}

test('runDay advances the day and is pure (input untouched)', () => {
  const before = stateWithStock();
  const snapshot = JSON.stringify(before);
  const result = runDay(before, { rollEventFn: noEvents });
  assert.equal(result.state.day, before.day + 1);
  assert.equal(JSON.stringify(before), snapshot);
});

test('runDay produces a consistent P&L report', () => {
  const result = runDay(stateWithStock(), {
    rollEventFn: noEvents,
    simulateFn: (s) => fixedOutcome(s, 50000),
  });
  const r = result.report;
  assert.equal(r.revenue, 50000);
  assert.equal(r.grossProfit, r.revenue - r.cogs);
  assert.equal(r.netProfit, r.grossProfit - r.expenses);
  assert.equal(r.unitsSold, 10);
});

test('cash never goes negative even on a brutal day', () => {
  const broke: GameState = { ...stateWithStock(), cash: 0 };
  const result = runDay(broke, {
    rollEventFn: noEvents,
    simulateFn: (s) => ({ ...fixedOutcome(s, 0), unitsSold: 0, perProduct: [] }),
  });
  assert.ok(result.state.cash >= 0);
});

test('profitable day starts a streak; report carries it', () => {
  const result = runDay(stateWithStock(), {
    rollEventFn: noEvents,
    simulateFn: (s) => fixedOutcome(s, 200000),
  });
  assert.equal(result.state.streak, 1);
  assert.equal(result.report.streak, 1);
});

test('big revenue gains levels and reports levelsGained', () => {
  const result = runDay(stateWithStock(), {
    rollEventFn: noEvents,
    simulateFn: (s) => fixedOutcome(s, 1000000),
  });
  assert.ok(result.levelsGained >= 1);
  assert.equal(result.state.level, 1 + result.levelsGained);
});

test('next day has fresh missions', () => {
  const result = runDay(stateWithStock(), { rollEventFn: noEvents });
  assert.ok(result.state.missions.some((m) => m.day === result.state.day));
});

test('report history is capped at 30', () => {
  let s = stateWithStock();
  for (let i = 0; i < 35; i++) {
    s = runDay(
      { ...s, inventory: addInventory([], 'phone_case', 5, 3000) },
      { rollEventFn: noEvents },
    ).state;
  }
  assert.equal(s.reports.length, 30);
  assert.equal(s.day, 36);
});
