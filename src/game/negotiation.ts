// Supplier haggling: "Bei ya jioni, boss?" — classic Kariakoo.
// Available on orders of 10+ units. Up to 3 rounds. Reputation helps.
// Push too hard and the supplier gets offended — price locks at full.

export const HAGGLE_MIN_QTY = 10;
export const MAX_ROUNDS = 3;

export type HaggleAsk = 5 | 10 | 15;

export type HaggleOutcome =
  | { result: 'accepted'; discountPercent: number }
  | { result: 'counter'; discountPercent: number }
  | { result: 'offended' };

const BASE_CHANCE: Record<HaggleAsk, number> = {
  5: 0.65,
  10: 0.4,
  15: 0.22,
};

const OFFEND_CHANCE: Record<HaggleAsk, number> = {
  5: 0.02,
  10: 0.06,
  15: 0.15,
};

export function acceptChance(ask: HaggleAsk, reputation: number, round: number): number {
  const repBonus = Math.max(0, Math.min(100, reputation)) * 0.002; // up to +20%
  const roundPenalty = (round - 1) * 0.12; // suppliers tire of long haggles
  return Math.max(0.05, Math.min(0.9, BASE_CHANCE[ask] + repBonus - roundPenalty));
}

export function attemptHaggle(
  ask: HaggleAsk,
  reputation: number,
  round: number,
  rand: () => number = Math.random,
): HaggleOutcome {
  const roll = rand();
  if (roll < OFFEND_CHANCE[ask] * (round >= MAX_ROUNDS ? 1.5 : 1)) {
    return { result: 'offended' };
  }
  if (rand() < acceptChance(ask, reputation, round)) {
    return { result: 'accepted', discountPercent: ask };
  }
  // Counter-offer: supplier meets you partway
  return { result: 'counter', discountPercent: Math.floor(ask / 2) };
}
