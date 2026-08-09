import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '@/data/products';
import { dayPriceFor } from '@/game/marketPrices';
import { marketOpportunityScore, rankMarketProducts } from '@/game/marketIntelligence';
import { purchaseCashPosition, safePurchaseQuantity } from '@/game/purchasePlanning';

test('market opportunity rewards demand and seasonal boosts', () => {
  const product = PRODUCTS.find((p) => p.id === 'phone_case')!;
  const price = dayPriceFor(product, 1);
  const normal = marketOpportunityScore(product, price, 0, 0);
  const boosted = marketOpportunityScore(product, price, 0.15, 0);
  assert.ok(boosted > normal);
});

test('market opportunity penalizes saturated stock', () => {
  const product = PRODUCTS.find((p) => p.id === 'phone_case')!;
  const price = dayPriceFor(product, 1);
  assert.ok(marketOpportunityScore(product, price, 0, 80) < marketOpportunityScore(product, price, 0, 0));
});

test('ranking is deterministic and score-first', () => {
  const products = PRODUCTS.slice(0, 4);
  const ranked = rankMarketProducts(products, (p) => p.id === products[2].id ? 100 : 1);
  assert.equal(ranked[0].id, products[2].id);
});

test('safe purchase quantity preserves a cash buffer', () => {
  assert.equal(safePurchaseQuantity(50000, 3000, 30), 4);
  assert.equal(safePurchaseQuantity(50000, 3000, 2), 2);
  assert.equal(safePurchaseQuantity(0, 3000, 30), 0);
  assert.equal(safePurchaseQuantity(10000, 3000, 30, 8000), 0);
});

test('purchase cash position warns when an order consumes operating reserve', () => {
  assert.equal(purchaseCashPosition(50000, 20000, 10000).safety, 'safe');
  assert.equal(purchaseCashPosition(50000, 43000, 10000).safety, 'tight');
  const unsafe = purchaseCashPosition(50000, 48000, 10000);
  assert.equal(unsafe.safety, 'unsafe');
  assert.equal(unsafe.reserveShortfall, 8000);
});
