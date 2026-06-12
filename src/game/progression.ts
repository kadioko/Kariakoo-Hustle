import { GameState } from '@/types';
import { ACHIEVEMENTS } from '@/data/achievements';
import { netWorth } from './economy';

// Gentler curve: 80 base, 1.35 multiplier → levels 1-5 feel achievable quickly
export function xpForLevel(level: number): number {
  return Math.round(80 * Math.pow(1.35, level - 1));
}

export function xpFromDay(revenue: number, netProfit: number): number {
  let xp = Math.floor(revenue / 5000);
  if (netProfit > 0) xp += Math.floor(netProfit / 8000);
  return Math.max(5, xp);
}

export function applyXp(state: GameState, gained: number): GameState {
  let xp = state.xp + gained;
  let level = state.level;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }
  return { ...state, xp, level };
}

export interface AchievementUnlockResult {
  state: GameState;
  newlyUnlocked: string[];
}

export function checkAchievements(state: GameState): AchievementUnlockResult {
  const newlyUnlocked: string[] = [];
  let next = { ...state };
  for (const a of ACHIEVEMENTS) {
    if (next.achievements.includes(a.id)) continue;
    const c = a.condition;
    let pass = false;
    switch (c.type) {
      case 'first_sale':
        pass = next.hasMadeFirstSale;
        break;
      case 'cash_at_least':
        pass = next.cash >= c.value;
        break;
      case 'net_worth_at_least':
        pass = netWorth(next) >= c.value;
        break;
      case 'workers_at_least':
        pass = next.workers.length >= c.value;
        break;
      case 'locations_at_least':
        pass = next.locations.length >= c.value;
        break;
      case 'upgrades_at_least':
        pass = next.upgrades.length >= c.value;
        break;
      case 'level_at_least':
        pass = next.level >= c.value;
        break;
      case 'streak_at_least':
        pass = next.bestStreak >= c.value;
        break;
      case 'day_at_least':
        pass = next.day >= c.value;
        break;
    }
    if (pass) {
      newlyUnlocked.push(a.id);
      next = {
        ...next,
        achievements: [...next.achievements, a.id],
        cash: next.cash + (a.reward?.cash ?? 0),
        reputation: next.reputation + (a.reward?.reputation ?? 0),
      };
      if (a.reward?.xp) {
        next = applyXp(next, a.reward.xp);
      }
    }
  }
  return { state: next, newlyUnlocked };
}
