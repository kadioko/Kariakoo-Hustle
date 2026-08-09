import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '@/game/saveGame';
import { dailyMarketBrief } from '@/game/dailyBrief';
import { inventoryCapacity } from '@/game/economy';

test('daily market brief is deterministic and recommends an affordable product', () => {
  const state = createInitialState();
  const first = dailyMarketBrief(state);
  const second = dailyMarketBrief(state);

  assert.ok(first);
  assert.deepEqual(first, second);
  assert.ok(first.quotedUnitPrice * first.suggestedQuantity <= state.cash);
  assert.ok(first.suggestedQuantity <= inventoryCapacity(state));
  assert.ok(first.expectedMargin >= 0);
});

test('daily market brief does not recommend stock when capacity is full', () => {
  const state = createInitialState();
  state.inventory = [{ productId: 'phone_case', quantity: inventoryCapacity(state), unitCost: 3000 }];

  assert.equal(dailyMarketBrief(state), undefined);
});
