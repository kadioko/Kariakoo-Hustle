import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '@/game/saveGame';
import { addInventory, calcDailyExpenses } from '@/game/economy';
import { recommendSellingStrategy } from '@/game/sellingStrategy';

test('advisor recommends safe selling for risky stock', () => {
  const state = createInitialState();
  assert.equal(recommendSellingStrategy({
    ...state,
    level: 3,
    inventory: addInventory([], 'smart_watch', 1, 35000),
  }), 'safe');
});

test('advisor recommends safe selling when budget-quality stock dominates', () => {
  const state = createInitialState();
  assert.equal(recommendSellingStrategy({
    ...state,
    cash: 100000,
    inventory: addInventory([], 'phone_case', 10, 2500, 1, 1.65),
  }), 'safe');
});

test('advisor recommends aggressive selling when cash runway is short', () => {
  const state = createInitialState();
  const expenses = calcDailyExpenses(state).total;
  assert.equal(recommendSellingStrategy({
    ...state,
    cash: Math.max(1, Math.floor(expenses * 2)),
    inventory: addInventory([], 'phone_case', 2, 3000),
  }), 'aggressive');
});

test('advisor recommends balanced selling for a healthy business', () => {
  const state = createInitialState();
  assert.equal(recommendSellingStrategy({
    ...state,
    cash: 100000,
    inventory: addInventory([], 'phone_case', 2, 3000),
  }), 'balanced');
});
