import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '@/game/saveGame';
import { addInventory } from '@/game/economy';
import { nextMoveFor } from '@/game/nextMove';

test('next move guides a new player to buy stock', () => {
  assert.equal(nextMoveFor(createInitialState()).id, 'buy_stock');
});

test('next move guides stocked players to their first sale', () => {
  const state = createInitialState();
  assert.equal(nextMoveFor({ ...state, inventory: addInventory([], 'phone_case', 2, 3000) }).id, 'first_sale');
});

test('pending events take priority over normal actions', () => {
  const state = createInitialState();
  assert.equal(nextMoveFor({ ...state, pendingEventId: 'supplier_choice' }).id, 'pending_event');
});

test('a recent loss points the player back to the report', () => {
  const state = createInitialState();
  assert.equal(nextMoveFor({
    ...state,
    inventory: addInventory([], 'phone_case', 2, 3000),
    reports: [{ day: 1, netProfit: -2000 } as any],
  }).id, 'learn_from_loss');
});

test('does not recommend an upgrade the player cannot afford', () => {
  const state = createInitialState();
  const stocked = {
    ...state,
    cash: 1000,
    inventory: addInventory([], 'phone_case', 2, 3000),
    reports: [{ day: 1, netProfit: 4000 } as any],
  };
  assert.notEqual(nextMoveFor(stocked).id, 'reinvest');
});
