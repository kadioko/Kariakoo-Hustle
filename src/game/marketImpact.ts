import { GameState } from '@/types';

// Dynamic supply and demand: heavy buying of one product saturates the market.
// Suppliers raise their prices on you, and customers get harder to find.
// Saturation decays each day, so spreading purchases out pays.

/** Suppliers charge more when you keep buying the same thing (max +15%). */
export function buyPriceImpact(saturation: number): number {
  return 1 + Math.min(0.15, saturation / 200);
}

/** A flooded market sells slower (max -25% sell rate). */
export function sellRateImpact(saturation: number): number {
  return 1 - Math.min(0.25, saturation / 150);
}

export function saturationFor(state: GameState, productId: string): number {
  return state.marketSaturation?.[productId] ?? 0;
}

export function addSaturation(
  map: Record<string, number>,
  productId: string,
  qty: number,
): Record<string, number> {
  return { ...map, [productId]: (map[productId] ?? 0) + qty };
}

/** Nightly decay: 30% of saturation clears each day; tiny leftovers clear fully. */
export function decaySaturation(map: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [id, v] of Object.entries(map ?? {})) {
    const decayed = Math.floor(v * 0.7);
    if (decayed > 1) next[id] = decayed;
  }
  return next;
}

/** UI helper: is the player visibly saturating this product's market? */
export function saturationLevel(saturation: number): 'none' | 'warm' | 'hot' {
  if (saturation >= 60) return 'hot';
  if (saturation >= 25) return 'warm';
  return 'none';
}
