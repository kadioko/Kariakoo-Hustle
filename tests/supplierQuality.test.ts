import assert from 'node:assert/strict';
import test from 'node:test';
import { addInventory } from '@/game/economy';
import { supplierQualityFor, supplierTierForReturnMultiplier, supplierUnitPrice } from '@/game/supplierQuality';

test('supplier quality creates a fair price versus return-risk tradeoff', () => {
  assert.ok(supplierUnitPrice(10000, 'budget') < supplierUnitPrice(10000, 'standard'));
  assert.ok(supplierUnitPrice(10000, 'premium') > supplierUnitPrice(10000, 'standard'));
  assert.ok(supplierQualityFor('budget').returnMultiplier > 1);
  assert.ok(supplierQualityFor('premium').returnMultiplier < 1);
});

test('restocking blends quality risk and preserves the visible tier', () => {
  let inventory = addInventory([], 'phone_case', 4, 3000, 1, 1.65);
  inventory = addInventory(inventory, 'phone_case', 4, 3600, 2, 0.45);

  assert.equal(inventory[0].qualityReturnMultiplier, 1.05);
  assert.equal(supplierTierForReturnMultiplier(inventory[0].qualityReturnMultiplier), 'standard');
});
