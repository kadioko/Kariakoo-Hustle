import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canPrestige,
  doPrestige,
  legacySalesBoost,
  legacyStartingCash,
  PRESTIGE_NET_WORTH,
} from '@/game/prestige';
import { daysLeftInSeason, seasonBoostFor, seasonForDay, SEASONS } from '@/game/seasons';
import { leaderboard, playerRank, RIVALS, rivalWorth } from '@/game/rivals';
import { bulkDiscountRate, STARTING_CASH } from '@/game/economy';
import { workerTenureBoost } from '@/game/salesSimulation';
import { createInitialState, normalizeGameState } from '@/game/saveGame';
import { GameState } from '@/types';

// — Prestige —

test('prestige requires the net worth target', () => {
  const fresh = createInitialState();
  assert.equal(canPrestige(fresh), false);
  const rich: GameState = { ...fresh, cash: PRESTIGE_NET_WORTH };
  assert.equal(canPrestige(rich), true);
});

test('prestige resets but keeps legacy, achievements, settings, name', () => {
  const rich: GameState = {
    ...createInitialState(),
    cash: PRESTIGE_NET_WORTH,
    day: 80,
    level: 9,
    businessName: 'Duka la Emmanuel',
    achievements: ['first_sale', 'level_5'],
    bestStreak: 6,
    settings: { language: 'en', sound: false, vibration: true },
  };
  const next = doPrestige(rich);
  assert.equal(next.legacyLevel, 1);
  assert.equal(next.day, 1);
  assert.equal(next.level, 1);
  assert.equal(next.cash, legacyStartingCash(1));
  assert.ok(next.cash > STARTING_CASH);
  assert.equal(next.businessName, 'Duka la Emmanuel');
  assert.deepEqual(next.achievements, ['first_sale', 'level_5']);
  assert.equal(next.bestStreak, 6);
  assert.equal(next.settings.language, 'en');
});

test('prestige is a no-op when not eligible', () => {
  const fresh = createInitialState();
  assert.equal(doPrestige(fresh), fresh);
});

test('legacy sales boost scales with level', () => {
  assert.equal(legacySalesBoost(0), 0);
  assert.equal(legacySalesBoost(2), 0.2);
});

// — Seasons —

test('seasons rotate weekly and deterministically', () => {
  assert.equal(seasonForDay(1).id, seasonForDay(7).id);
  assert.notEqual(seasonForDay(7).id, seasonForDay(8).id);
  assert.equal(seasonForDay(1).id, seasonForDay(1 + 7 * SEASONS.length).id);
});

test('season boost applies only to boosted categories', () => {
  const season = seasonForDay(10);
  const boosted = season.boostedCategories[0];
  assert.equal(seasonBoostFor(10, boosted), season.boostPercent);
  const all = ['food', 'school', 'home', 'phone_accessories'] as const;
  const unboosted = all.find((c) => !season.boostedCategories.includes(c));
  if (unboosted) assert.equal(seasonBoostFor(10, unboosted), 0);
});

test('daysLeftInSeason counts down from 7', () => {
  assert.equal(daysLeftInSeason(1), 7);
  assert.equal(daysLeftInSeason(7), 1);
  assert.equal(daysLeftInSeason(8), 7);
});

// — Rivals —

test('rival worth is deterministic and grows over time', () => {
  for (const r of RIVALS) {
    assert.equal(rivalWorth(r, 20), rivalWorth(r, 20));
    assert.ok(rivalWorth(r, 100) > rivalWorth(r, 1));
  }
});

test('leaderboard includes player and is sorted desc', () => {
  const state = createInitialState();
  const board = leaderboard(state);
  assert.equal(board.length, RIVALS.length + 1);
  assert.ok(board.some((e) => e.isPlayer));
  for (let i = 1; i < board.length; i++) {
    assert.ok(board[i - 1].worth >= board[i].worth);
  }
  const rank = playerRank(state);
  assert.ok(rank >= 1 && rank <= board.length);
});

// — Bulk discounts —

test('bulk discount tiers', () => {
  assert.equal(bulkDiscountRate(1), 0);
  assert.equal(bulkDiscountRate(19), 0);
  assert.equal(bulkDiscountRate(20), 0.05);
  assert.equal(bulkDiscountRate(49), 0.05);
  assert.equal(bulkDiscountRate(50), 0.1);
});

// — Worker tenure —

test('worker tenure boost grows and caps at 5%', () => {
  const base = createInitialState();
  const state: GameState = {
    ...base,
    day: 1,
    workers: ['sales_assistant'],
    workerHiredOnDay: { sales_assistant: 1 },
  };
  assert.equal(workerTenureBoost(state, 'sales_assistant'), 0);
  assert.equal(workerTenureBoost({ ...state, day: 11 }, 'sales_assistant'), 0.005);
  assert.equal(workerTenureBoost({ ...state, day: 500 }, 'sales_assistant'), 0.05);
  assert.equal(workerTenureBoost(state, 'accountant'), 0); // never hired
});

// — Save v8 fields —

test('normalize defaults legacy and tenure fields', () => {
  const s = normalizeGameState({ cash: 100 } as Partial<GameState>);
  assert.equal(s.legacyLevel, 0);
  assert.deepEqual(s.workerHiredOnDay, {});
});
