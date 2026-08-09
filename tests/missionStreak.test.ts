import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '@/game/saveGame';
import { evaluateMissions } from '@/game/missions';
import { DailyReport, GameState } from '@/types';

function missionReport(day: number): DailyReport {
  return {
    day, revenue: 100000, cogs: 30000, grossProfit: 70000, expenses: 5000,
    netProfit: 65000, unitsSold: 20, unitsRemaining: 0, reputationChange: 1,
    returnedUnits: 0, qualityLoss: 0, advice: 'Sawa', adviceEn: 'Good',
  };
}

function completeState(day: number, streak = 0): GameState {
  const base = createInitialState();
  return {
    ...base,
    day,
    missionStreak: streak,
    missions: base.missions.map((mission) => ({ ...mission, day, target: 1 })),
  };
}

test('completing all daily missions increments the mission streak', () => {
  const result = evaluateMissions(completeState(1), missionReport(1));
  assert.equal(result.state.missionStreak, 1);
  assert.equal(result.missionStreakBonus, 0);
});

test('third consecutive full mission day grants a capped bonus', () => {
  const state = completeState(3, 2);
  const result = evaluateMissions(state, missionReport(3));
  assert.equal(result.state.missionStreak, 3);
  assert.equal(result.missionStreakBonus, 5000);
  assert.equal(result.state.cash, state.cash + 5000);
});

test('missing a full mission day resets the streak without a penalty', () => {
  const state = completeState(4, 2);
  const report = { ...missionReport(4), revenue: 0, unitsSold: 0, netProfit: 0 };
  const result = evaluateMissions(state, report);
  assert.equal(result.state.missionStreak, 0);
  assert.equal(result.missionStreakBonus, 0);
});
