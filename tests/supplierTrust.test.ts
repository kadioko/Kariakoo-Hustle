import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_SUPPLIER_DISCOUNT,
  supplierTrustAfterPurchase,
  supplierTrustDiscount,
  supplierTrustLevel,
} from '@/game/supplierTrust';
import { acceptChance } from '@/game/negotiation';
import { createInitialState, normalizeGameState, SAVE_VERSION } from '@/game/saveGame';

test('supplier trust earns a small bounded price advantage', () => {
  assert.equal(supplierTrustDiscount(0), 0);
  assert.equal(supplierTrustDiscount(100), MAX_SUPPLIER_DISCOUNT);
  assert.equal(supplierTrustDiscount(999), MAX_SUPPLIER_DISCOUNT);
  assert.ok(supplierTrustDiscount(50) > 0);
  assert.equal(supplierTrustLevel(0).id, 'new');
  assert.equal(supplierTrustLevel(75).id, 'inner_circle');
});

test('supplier trust rewards repeat quality orders while deep haggling has a tradeoff', () => {
  assert.equal(supplierTrustAfterPurchase(0, 1, 'standard'), 1);
  assert.equal(supplierTrustAfterPurchase(10, 20, 'premium'), 14);
  assert.equal(supplierTrustAfterPurchase(10, 20, 'budget', 15), 10);
  assert.equal(supplierTrustAfterPurchase(99, 100, 'premium'), 100);
});

test('supplier trust modestly improves haggle odds and migrates from old saves', () => {
  assert.ok(acceptChance(10, 20, 1, 100) > acceptChance(10, 20, 1, 0));

  const migrated = normalizeGameState({ saveVersion: 12, cash: 50000 });
  assert.equal(migrated.saveVersion, SAVE_VERSION);
  assert.equal(migrated.supplierTrust, 0);
  assert.equal(createInitialState().supplierTrust, 0);
});
