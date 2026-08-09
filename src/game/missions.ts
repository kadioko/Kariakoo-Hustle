import { DailyReport, GameState, Mission, MissionResult } from '@/types';
import { formatTZS } from '@/utils/format';

function pick(seed: number, index: number): number {
  const x = Math.sin(seed * 999 + index * 37) * 10000;
  return x - Math.floor(x);
}

export function generateDailyMissions(day: number, level: number): Mission[] {
  const revenueTarget = Math.round((28000 + level * 9000) / 1000) * 1000;
  const unitTarget = Math.max(4, Math.min(35, 5 + level * 2));
  const profitTarget = Math.round((10000 + level * 4500) / 1000) * 1000;

  const pool: Mission[] = [
    {
      id: `d${day}_revenue`,
      day,
      metric: 'revenue',
      title: `Fikisha mauzo ${formatTZS(revenueTarget)}`,
      titleEn: `Reach ${formatTZS(revenueTarget)} revenue`,
      target: revenueTarget,
      reward: { xp: 12 + level * 2, cash: 2500 + level * 500 },
    },
    {
      id: `d${day}_units`,
      day,
      metric: 'units_sold',
      title: `Uza vipande ${unitTarget}`,
      titleEn: `Sell ${unitTarget} units`,
      target: unitTarget,
      reward: { xp: 10 + level * 2 },
    },
    {
      id: `d${day}_profit`,
      day,
      metric: 'net_profit',
      title: `Pata faida ${formatTZS(profitTarget)}`,
      titleEn: `Earn ${formatTZS(profitTarget)} profit`,
      target: profitTarget,
      reward: { xp: 14 + level * 2, reputation: 1 },
    },
    {
      id: `d${day}_quality`,
      day,
      metric: 'no_quality_loss',
      title: 'Maliza siku bila return',
      titleEn: 'Finish the day with no returns',
      target: 1,
      reward: { xp: 10 + level, reputation: 1 },
    },
  ];

  const first = Math.floor(pick(day + level, 1) * pool.length);
  let second = Math.floor(pick(day + level, 2) * pool.length);
  if (second === first) second = (second + 1) % pool.length;

  return [pool[first], pool[second]];
}

export function ensureDailyMissions(state: GameState): GameState {
  const hasToday = state.missions.some((mission) => mission.day === state.day);
  if (hasToday) return state;
  return {
    ...state,
    missions: generateDailyMissions(state.day, state.level),
  };
}

function missionProgress(mission: Mission, report: DailyReport): number {
  switch (mission.metric) {
    case 'revenue':
      return report.revenue;
    case 'units_sold':
      return report.unitsSold;
    case 'net_profit':
      return Math.max(0, report.netProfit);
    case 'no_quality_loss':
      return (report.returnedUnits ?? 0) === 0 && (report.qualityLoss ?? 0) === 0 ? 1 : 0;
  }
}

function rewardText(mission: Mission): { sw: string; en: string } {
  const partsSw = [
    mission.reward.cash ? `+${formatTZS(mission.reward.cash)}` : null,
    mission.reward.xp ? `+${mission.reward.xp} XP` : null,
    mission.reward.reputation ? `+${mission.reward.reputation} sifa` : null,
  ].filter(Boolean);
  const partsEn = [
    mission.reward.cash ? `+${formatTZS(mission.reward.cash)}` : null,
    mission.reward.xp ? `+${mission.reward.xp} XP` : null,
    mission.reward.reputation ? `+${mission.reward.reputation} rep` : null,
  ].filter(Boolean);
  return { sw: partsSw.join(' · '), en: partsEn.join(' · ') };
}

export function evaluateMissions(state: GameState, report: DailyReport): {
  state: GameState;
  missionResults: MissionResult[];
  missionStreakBonus: number;
} {
  let next = { ...state };
  const missionResults = state.missions
    .filter((mission) => mission.day === report.day)
    .map((mission) => {
      const progress = missionProgress(mission, report);
      const completed = progress >= mission.target;
      const reward = rewardText(mission);

      if (completed && !next.completedMissionIds.includes(mission.id)) {
        next = {
          ...next,
          cash: next.cash + (mission.reward.cash ?? 0),
          xp: next.xp + (mission.reward.xp ?? 0),
          reputation: Math.max(-10, Math.min(100, next.reputation + (mission.reward.reputation ?? 0))),
          completedMissionIds: [...next.completedMissionIds, mission.id],
        };
      }

      return {
        id: mission.id,
        title: mission.title,
        titleEn: mission.titleEn,
        completed,
        progress,
        target: mission.target,
        rewardText: reward.sw,
        rewardTextEn: reward.en,
      };
    });

  const completedAll = missionResults.length > 0 && missionResults.every((mission) => mission.completed);
  const missionStreak = completedAll ? (state.missionStreak ?? 0) + 1 : 0;
  const missionStreakBonus = missionStreak === 3 ? 5000 : missionStreak === 7 ? 12000 : 0;
  next = {
    ...next,
    missionStreak,
    bestMissionStreak: Math.max(state.bestMissionStreak ?? 0, missionStreak),
    cash: next.cash + missionStreakBonus,
    xp: next.xp + (missionStreakBonus > 0 ? 20 : 0),
  };

  return { state: next, missionResults, missionStreakBonus };
}
