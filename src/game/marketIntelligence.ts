import { Product } from '@/types';
import { DayPrice } from './marketPrices';

const demandWeight = { low: 0, medium: 8, high: 16, very_high: 24 } as const;
const riskPenalty = { low: 0, medium: 5, high: 10 } as const;

export function marketOpportunityScore(
  product: Product,
  price: DayPrice,
  seasonBoost: number,
  saturation: number,
): number {
  const marginPercent = price.buyPrice > 0
    ? ((price.sellPrice - price.buyPrice) / price.buyPrice) * 100
    : 0;
  const dealBonus = price.buyTrend === 'down' ? 8 : price.buyTrend === 'up' ? -5 : 0;
  const saturationPenalty = Math.min(12, saturation / 10);
  return Math.round(
    marginPercent + demandWeight[product.demand] + seasonBoost * 100 + dealBonus
      - riskPenalty[product.risk] - saturationPenalty,
  );
}

export function rankMarketProducts(
  products: Product[],
  scoreFor: (product: Product) => number,
): Product[] {
  return [...products].sort((a, b) => {
    const scoreDiff = scoreFor(b) - scoreFor(a);
    return scoreDiff || a.unlockLevel - b.unlockLevel || a.buyPrice - b.buyPrice;
  });
}
