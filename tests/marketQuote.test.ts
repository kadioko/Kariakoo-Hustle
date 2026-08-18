import assert from 'node:assert/strict';
import test from 'node:test';
import { findProduct } from '@/data/products';
import { marketQuoteFor, quotedBuyPriceFor } from '@/game/marketQuote';
import { createInitialState } from '@/game/saveGame';

test('market quote is deterministic and is the source of truth for a product quote', () => {
  const state = createInitialState();
  const product = findProduct('phone_case')!;
  const quote = marketQuoteFor(state, product);

  assert.equal(quote.quotedBuyPrice, quotedBuyPriceFor(state, product, quote.dayPrice));
  assert.ok(quote.quotedBuyPrice > 0);
});

test('market quote reflects supplier trust and market saturation', () => {
  const product = findProduct('phone_case')!;
  const base = createInitialState();
  const trusted = { ...base, supplierTrust: 100 };
  const saturated = { ...base, marketSaturation: { [product.id]: 100 } };

  assert.ok(quotedBuyPriceFor(trusted, product) < quotedBuyPriceFor(base, product));
  assert.ok(quotedBuyPriceFor(saturated, product) > quotedBuyPriceFor(base, product));
});
