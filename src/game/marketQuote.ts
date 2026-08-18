import { GameState, Product } from '@/types';
import { cityBuyFactor } from './cities';
import { buyPriceImpact, saturationFor } from './marketImpact';
import { DayPrice, dayPriceFor } from './marketPrices';
import { supplierTrustDiscount } from './supplierTrust';

/**
 * The one source of truth for a supplier quote. Every recommendation and checkout should use it,
 * so city pricing, local saturation, and supplier trust never disagree with the player-facing UI.
 */
export function quotedBuyPriceFor(
  state: GameState,
  product: Product,
  dayPrice: DayPrice = dayPriceFor(product, state.day),
): number {
  return Math.max(
    1,
    Math.round(
      dayPrice.buyPrice
        * cityBuyFactor(state.currentCityId, product.category)
        * buyPriceImpact(saturationFor(state, product.id))
        * (1 - supplierTrustDiscount(state.supplierTrust)),
    ),
  );
}

export interface MarketQuote {
  dayPrice: DayPrice;
  quotedBuyPrice: number;
}

export function marketQuoteFor(state: GameState, product: Product): MarketQuote {
  const dayPrice = dayPriceFor(product, state.day);
  return { dayPrice, quotedBuyPrice: quotedBuyPriceFor(state, product, dayPrice) };
}
