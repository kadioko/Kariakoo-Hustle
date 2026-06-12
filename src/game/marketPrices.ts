import { Product } from '@/types';

// Deterministic daily price fluctuation.
// Same (day, productId) always gives the same prices, so the market
// is stable within a day and consistent across app restarts.

function hashSeed(day: number, productId: string, salt: number): number {
  let h = day * 374761393 + salt * 668265263;
  for (let i = 0; i < productId.length; i++) {
    h = (h ^ productId.charCodeAt(i)) * 16777619;
    h = h >>> 0;
  }
  // map to 0..1
  const x = Math.sin(h % 100000) * 10000;
  return x - Math.floor(x);
}

// Buy price swings wider than sell price so "buy on a dip" matters.
const BUY_MIN = 0.85;
const BUY_MAX = 1.2;
const SELL_MIN = 0.9;
const SELL_MAX = 1.15;

export type PriceTrend = 'up' | 'down' | 'flat';

export interface DayPrice {
  buyPrice: number;
  sellPrice: number;
  buyMult: number;
  sellMult: number;
  /** Buy price direction vs yesterday */
  buyTrend: PriceTrend;
  /** Sell price direction vs yesterday */
  sellTrend: PriceTrend;
}

function roundPrice(v: number): number {
  if (v >= 10000) return Math.round(v / 500) * 500;
  if (v >= 1000) return Math.round(v / 100) * 100;
  return Math.round(v / 50) * 50;
}

function multipliers(day: number, productId: string): { buy: number; sell: number } {
  const rBuy = hashSeed(day, productId, 1);
  const rSell = hashSeed(day, productId, 2);
  const buy = BUY_MIN + rBuy * (BUY_MAX - BUY_MIN);
  // Sell partially correlates with buy (hot product = everything up)
  const sell = SELL_MIN + (0.5 * rBuy + 0.5 * rSell) * (SELL_MAX - SELL_MIN);
  return { buy, sell };
}

function trend(today: number, yesterday: number): PriceTrend {
  const diff = today - yesterday;
  if (Math.abs(diff) < 0.02) return 'flat';
  return diff > 0 ? 'up' : 'down';
}

export function dayPriceFor(product: Product, day: number): DayPrice {
  const m = multipliers(day, product.id);
  const prev = multipliers(Math.max(1, day - 1), product.id);
  return {
    buyPrice: roundPrice(product.buyPrice * m.buy),
    sellPrice: roundPrice(product.sellPrice * m.sell),
    buyMult: m.buy,
    sellMult: m.sell,
    buyTrend: day <= 1 ? 'flat' : trend(m.buy, prev.buy),
    sellTrend: day <= 1 ? 'flat' : trend(m.sell, prev.sell),
  };
}

/** True when today's buy price is a meaningful discount vs base. */
export function isGoodDeal(price: DayPrice): boolean {
  return price.buyMult <= 0.92;
}

/** True when today's buy price is meaningfully inflated vs base. */
export function isExpensive(price: DayPrice): boolean {
  return price.buyMult >= 1.1;
}
