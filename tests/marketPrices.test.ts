import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayPriceFor } from '@/game/marketPrices';
import { PRODUCTS } from '@/data/products';

test('day prices are deterministic for the same day/product', () => {
  for (const p of PRODUCTS) {
    const a = dayPriceFor(p, 12);
    const b = dayPriceFor(p, 12);
    assert.equal(a.buyPrice, b.buyPrice);
    assert.equal(a.sellPrice, b.sellPrice);
  }
});

test('buy prices stay within 85%-120% of base', () => {
  for (const p of PRODUCTS) {
    for (let day = 1; day <= 60; day++) {
      const price = dayPriceFor(p, day);
      assert.ok(price.buyMult >= 0.85 && price.buyMult <= 1.2, `${p.id} d${day} buyMult=${price.buyMult}`);
      assert.ok(price.buyPrice > 0);
    }
  }
});

test('sell prices stay within 90%-115% of base', () => {
  for (const p of PRODUCTS) {
    for (let day = 1; day <= 60; day++) {
      const price = dayPriceFor(p, day);
      assert.ok(price.sellMult >= 0.9 && price.sellMult <= 1.15, `${p.id} d${day} sellMult=${price.sellMult}`);
    }
  }
});

test('prices vary across days (market actually moves)', () => {
  const p = PRODUCTS[0];
  const prices = new Set<number>();
  for (let day = 1; day <= 30; day++) {
    prices.add(dayPriceFor(p, day).buyPrice);
  }
  assert.ok(prices.size > 5, `expected variety, got ${prices.size} distinct prices`);
});

test('day 1 has flat trend', () => {
  const price = dayPriceFor(PRODUCTS[0], 1);
  assert.equal(price.buyTrend, 'flat');
  assert.equal(price.sellTrend, 'flat');
});
