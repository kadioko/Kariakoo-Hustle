import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addInventory } from '@/game/economy';
import { stockAgeDays, stockAgeSellRateImpact, stockAgeTone } from '@/game/stockAging';

test('stock aging has a three-day grace period', () => {
  const item = addInventory([], 'phone_case', 5, 3000, 1)[0];
  assert.equal(stockAgeDays(item, 4), 3);
  assert.equal(stockAgeSellRateImpact(item, 4), 1);
});

test('older stock sells more slowly but the drag is capped', () => {
  const item = addInventory([], 'phone_case', 5, 3000, 1)[0];
  assert.equal(stockAgeSellRateImpact(item, 6), 0.9);
  assert.equal(stockAgeSellRateImpact(item, 99), 0.7);
});

test('new purchases blend their acquisition day when restocking', () => {
  let inventory = addInventory([], 'phone_case', 10, 3000, 1);
  inventory = addInventory(inventory, 'phone_case', 10, 4000, 5);
  assert.equal(inventory[0].acquiredDay, 3);
  assert.equal(stockAgeTone(7), 'old');
});
