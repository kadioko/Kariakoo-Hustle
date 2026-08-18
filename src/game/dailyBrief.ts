import { PRODUCTS } from '@/data/products';
import { GameState, Product } from '@/types';
import { calcDailyExpenses, inventoryCapacity, inventoryUnits } from './economy';
import { saturationFor } from './marketImpact';
import { dayPriceFor, isGoodDeal } from './marketPrices';
import { quotedBuyPriceFor } from './marketQuote';
import { marketOpportunityScore } from './marketIntelligence';
import { safePurchaseQuantity } from './purchasePlanning';
import { seasonBoostFor, seasonForDay } from './seasons';

export interface DailyMarketBrief {
  product: Product;
  quotedUnitPrice: number;
  suggestedQuantity: number;
  expectedMargin: number;
  score: number;
  reason: string;
  reasonEn: string;
}

/**
 * Picks one affordable, currently unlocked product using the same market inputs
 * shown in the market screen. It is advice, never an automatic purchase.
 */
export function dailyMarketBrief(state: GameState): DailyMarketBrief | undefined {
  const freeSlots = Math.max(0, inventoryCapacity(state) - inventoryUnits(state));
  if (freeSlots === 0) return undefined;

  const candidates = PRODUCTS
    .filter((product) => product.unlockLevel <= state.level)
    .map((product) => {
      const basePrice = dayPriceFor(product, state.day);
      const quotedUnitPrice = quotedBuyPriceFor(state, product, basePrice);
      const price = { ...basePrice, buyPrice: quotedUnitPrice };
      const saturation = saturationFor(state, product.id);
      const seasonBoost = seasonBoostFor(state.day, product.category);
      const suggestedQuantity = safePurchaseQuantity(
        state.cash,
        quotedUnitPrice,
        freeSlots,
        calcDailyExpenses(state).total * 2,
      );

      return {
        product,
        basePrice,
        quotedUnitPrice,
        saturation,
        seasonBoost,
        suggestedQuantity,
        score: marketOpportunityScore(product, price, seasonBoost, saturation),
      };
    })
    .filter((candidate) => candidate.suggestedQuantity > 0);

  if (candidates.length === 0) return undefined;

  const best = candidates.sort((a, b) => b.score - a.score || a.quotedUnitPrice - b.quotedUnitPrice)[0];
  const season = seasonForDay(state.day);
  const expectedMargin = Math.max(0, best.basePrice.sellPrice - best.quotedUnitPrice);
  const expenseBuffer = calcDailyExpenses(state).total * 2;

  let reason: string;
  let reasonEn: string;
  if (best.seasonBoost > 0) {
    reason = `${season.name} inaongeza demand ya bidhaa hii wiki hii.`;
    reasonEn = `${season.nameEn} is lifting demand for this product this week.`;
  } else if (isGoodDeal(best.basePrice) || best.quotedUnitPrice < best.product.buyPrice) {
    reason = 'Bei ya supplier iko poa leo; margin ina nafasi nzuri.';
    reasonEn = 'The supplier price is favourable today, leaving a healthy margin.';
  } else if (best.saturation >= 25) {
    reason = 'Bado inaenda, lakini nunua kiasi kidogo ili usijaze soko.';
    reasonEn = 'It can still move, but buy a smaller batch so you do not flood the market.';
  } else if (state.cash <= expenseBuffer) {
    reason = 'Chukua batch ndogo tu ili uache cash ya rent na transport.';
    reasonEn = 'Take a small batch and keep cash for rent and transport.';
  } else {
    reason = 'Demand na margin vimekaa sawa kwa mzunguko wa leo.';
    reasonEn = 'Demand and margin are balanced for today\'s trading cycle.';
  }

  return {
    product: best.product,
    quotedUnitPrice: best.quotedUnitPrice,
    suggestedQuantity: best.suggestedQuantity,
    expectedMargin,
    score: best.score,
    reason,
    reasonEn,
  };
}
