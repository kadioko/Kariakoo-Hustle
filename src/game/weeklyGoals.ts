import { DailyReport, GameState, WeeklyGoal, WeeklyGoalMetric } from '@/types';
import { formatTZS } from '@/utils/format';

function rewardText(goal: WeeklyGoal): { sw: string; en: string } {
  const sw = [
    goal.reward.cash ? `+${formatTZS(goal.reward.cash)}` : null,
    goal.reward.xp ? `+${goal.reward.xp} XP` : null,
    goal.reward.reputation ? `+${goal.reward.reputation} sifa` : null,
  ].filter(Boolean).join(' · ');
  const en = [
    goal.reward.cash ? `+${formatTZS(goal.reward.cash)}` : null,
    goal.reward.xp ? `+${goal.reward.xp} XP` : null,
    goal.reward.reputation ? `+${goal.reward.reputation} rep` : null,
  ].filter(Boolean).join(' · ');
  return { sw, en };
}

export function generateWeeklyGoals(startDay: number, level: number, upgradeBaseline = 0): WeeklyGoal[] {
  const endDay = startDay + 6;
  const revenueTarget = Math.round((500000 + Math.max(0, level - 1) * 90000) / 10000) * 10000;
  const unitTarget = Math.min(140, 50 + level * 8);

  return [
    {
      id: `w${startDay}_revenue`,
      startDay,
      endDay,
      metric: 'revenue',
      title: `Fikisha mauzo ya wiki ${formatTZS(revenueTarget)}`,
      titleEn: `Make ${formatTZS(revenueTarget)} weekly revenue`,
      target: revenueTarget,
      reward: { cash: 12000 + level * 1500, xp: 30 + level * 4 },
    },
    {
      id: `w${startDay}_units`,
      startDay,
      endDay,
      metric: 'units_sold',
      title: `Uza vipande ${unitTarget} wiki hii`,
      titleEn: `Sell ${unitTarget} units this week`,
      target: unitTarget,
      reward: { xp: 28 + level * 3, reputation: 1 },
    },
    {
      id: `w${startDay}_positive`,
      startDay,
      endDay,
      metric: 'positive_days',
      title: 'Maliza siku 3 bila hasara',
      titleEn: 'Finish 3 days without a loss',
      target: 3,
      reward: { xp: 24 + level * 3, reputation: 2 },
    },
    {
      id: `w${startDay}_upgrade`,
      startDay,
      endDay,
      metric: 'upgrade_count',
      title: 'Nunua boresho 1 wiki hii',
      titleEn: 'Buy 1 upgrade this week',
      target: 1,
      baseline: upgradeBaseline,
      reward: { xp: 30 + level * 4, reputation: 1 },
    },
  ];
}

function reportsInGoalWindow(state: GameState, goal: WeeklyGoal): DailyReport[] {
  return state.reports.filter((report) => report.day >= goal.startDay && report.day <= goal.endDay);
}

export function weeklyGoalProgress(state: GameState, goal: WeeklyGoal): number {
  const reports = reportsInGoalWindow(state, goal);
  switch (goal.metric as WeeklyGoalMetric) {
    case 'revenue':
      return reports.reduce((sum, report) => sum + report.revenue, 0);
    case 'units_sold':
      return reports.reduce((sum, report) => sum + report.unitsSold, 0);
    case 'positive_days':
      return reports.filter((report) => report.netProfit >= 0).length;
    case 'upgrade_count':
      return Math.max(0, state.upgrades.length - (goal.baseline ?? 0));
  }
}

export function ensureWeeklyGoals(state: GameState): GameState {
  const active = state.weeklyGoals.some((goal) => state.day >= goal.startDay && state.day <= goal.endDay);
  if (active) return state;
  const startDay = Math.floor((state.day - 1) / 7) * 7 + 1;
  return {
    ...state,
    weeklyGoals: generateWeeklyGoals(startDay, state.level, state.upgrades.length),
  };
}

export function evaluateWeeklyGoals(state: GameState): {
  state: GameState;
  completed: { id: string; title: string; titleEn: string; rewardText: string; rewardTextEn: string }[];
} {
  let next = ensureWeeklyGoals(state);
  const completed: { id: string; title: string; titleEn: string; rewardText: string; rewardTextEn: string }[] = [];

  next.weeklyGoals.forEach((goal) => {
    if (next.completedWeeklyGoalIds.includes(goal.id)) return;
    if (weeklyGoalProgress(next, goal) < goal.target) return;
    const reward = rewardText(goal);
    next = {
      ...next,
      cash: next.cash + (goal.reward.cash ?? 0),
      xp: next.xp + (goal.reward.xp ?? 0),
      reputation: Math.max(-10, Math.min(100, next.reputation + (goal.reward.reputation ?? 0))),
      completedWeeklyGoalIds: [...next.completedWeeklyGoalIds, goal.id],
    };
    completed.push({
      id: goal.id,
      title: goal.title,
      titleEn: goal.titleEn,
      rewardText: reward.sw,
      rewardTextEn: reward.en,
    });
  });

  return { state: next, completed };
}
