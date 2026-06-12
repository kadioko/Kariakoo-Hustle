import { GameEvent, GameState } from '@/types';
import { netWorth } from './economy';
import { RIVAL_EVENTS } from '@/data/rivalEvents';

// Rival traders: deterministic NPC net worth curves the player races.
// Same day always gives the same worth, so rivals feel consistent.

export interface Rival {
  id: string;
  name: string;
  emoji: string;
  flavor: string;
  flavorEn: string;
  baseWorth: number;
  dailyGrowth: number; // compound growth per day
  wobble: number; // daily variance amplitude
}

export const RIVALS: Rival[] = [
  {
    id: 'mzee_juma',
    name: 'Mzee Juma',
    emoji: '🎩',
    flavor: 'Mfanyabiashara wa zamani. Anakua polepole lakini hakika.',
    flavorEn: 'Old-school trader. Grows slowly but surely.',
    baseWorth: 900000,
    dailyGrowth: 1.035,
    wobble: 0.04,
  },
  {
    id: 'dada_neema',
    name: 'Dada Neema',
    emoji: '💼',
    flavor: 'Mfalme wa mitandao. Mauzo ya online yanakua kasi.',
    flavorEn: 'Social media queen. Online sales growing fast.',
    baseWorth: 250000,
    dailyGrowth: 1.06,
    wobble: 0.08,
  },
  {
    id: 'kaka_bofu',
    name: 'Kaka Bofu',
    emoji: '🧢',
    flavor: 'Kijana mwenye hasira ya biashara. Juu chini kila siku.',
    flavorEn: 'Hungry young hustler. Up and down every day.',
    baseWorth: 60000,
    dailyGrowth: 1.075,
    wobble: 0.15,
  },
];

function wobbleFactor(rivalId: string, day: number, amplitude: number): number {
  let h = day * 2654435761;
  for (let i = 0; i < rivalId.length; i++) {
    h = ((h ^ rivalId.charCodeAt(i)) * 16777619) >>> 0;
  }
  const r = Math.abs(Math.sin(h % 100000)); // 0..1
  return 1 + (r * 2 - 1) * amplitude;
}

export function rivalWorth(rival: Rival, day: number): number {
  const d = Math.max(1, day);
  const compound = rival.baseWorth * Math.pow(rival.dailyGrowth, d - 1);
  return Math.round(compound * wobbleFactor(rival.id, d, rival.wobble));
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  emoji: string;
  worth: number;
  isPlayer: boolean;
}

export function leaderboard(state: GameState): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = RIVALS.map((r) => ({
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    worth: rivalWorth(r, state.day),
    isPlayer: false,
  }));
  entries.push({
    id: 'player',
    name: state.businessName,
    emoji: '⭐',
    worth: netWorth(state),
    isPlayer: true,
  });
  return entries.sort((a, b) => b.worth - a.worth);
}

export function playerRank(state: GameState): number {
  return leaderboard(state).findIndex((e) => e.isPlayer) + 1;
}

const RIVAL_EVENT_CHANCE = 0.12;

/**
 * Rivals react to you: undercuts when you're winning, poaching when you
 * have workers, alliances when you're established. Rolled before normal
 * street events each day.
 */
export function rollRivalEvent(
  state: GameState,
  rand: () => number = Math.random,
): GameEvent | undefined {
  if (rand() >= RIVAL_EVENT_CHANCE) return undefined;

  const rank = playerRank(state);
  const eligible = RIVAL_EVENTS.filter((e) => {
    if ((e.minLevel ?? 1) > state.level) return false;
    if (e.id === 'rival_juma_poach' && state.workers.length === 0) return false;
    // Bofu only undercuts you when you're ahead of him
    if (e.id === 'rival_bofu_undercut' && rank > 2) return false;
    return true;
  });
  if (eligible.length === 0) return undefined;

  return eligible[Math.floor(rand() * eligible.length) % eligible.length];
}
