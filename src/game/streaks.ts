// Profit streaks: consecutive profitable days earn an escalating cash bonus.

/** Bonus as % of net profit, capped. Starts from the 2nd consecutive day. */
export function streakBonusPercent(streak: number): number {
  if (streak < 2) return 0;
  return Math.min(0.1, (streak - 1) * 0.02); // 2% per day after the first, max 10%
}

export function streakBonusCash(streak: number, netProfit: number): number {
  if (netProfit <= 0) return 0;
  return Math.round(netProfit * streakBonusPercent(streak));
}

export function nextStreak(current: number, netProfit: number): number {
  return netProfit > 0 ? current + 1 : 0;
}

export function streakEmoji(streak: number): string {
  if (streak >= 7) return '🔥🔥🔥';
  if (streak >= 4) return '🔥🔥';
  if (streak >= 2) return '🔥';
  return '';
}
