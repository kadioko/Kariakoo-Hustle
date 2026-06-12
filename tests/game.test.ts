import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addInventory, clearanceUnitPrice, calcDailyExpenses, settleDailyLoans } from '@/game/economy';
import { createInitialState, normalizeGameState } from '@/game/saveGame';
import { nextStreak, streakBonusCash, streakBonusPercent } from '@/game/streaks';
import { applyXp, checkAchievements } from '@/game/progression';
import { findProduct } from '@/data/products';
import { GameState } from '@/types';

// — Streaks —

test('streak increments on profit, resets on loss', () => {
  assert.equal(nextStreak(0, 5000), 1);
  assert.equal(nextStreak(3, 5000), 4);
  assert.equal(nextStreak(5, -100), 0);
  assert.equal(nextStreak(2, 0), 0);
});

test('streak bonus scales and caps at 10%', () => {
  assert.equal(streakBonusPercent(1), 0);
  assert.equal(streakBonusPercent(2), 0.02);
  assert.equal(streakBonusPercent(6), 0.1);
  assert.equal(streakBonusPercent(20), 0.1);
  assert.equal(streakBonusCash(3, 100000), 4000);
  assert.equal(streakBonusCash(3, -5000), 0);
});

// — Inventory —

test('addInventory blends unit cost', () => {
  let inv = addInventory([], 'phone_case', 10, 3000);
  inv = addInventory(inv, 'phone_case', 10, 5000);
  assert.equal(inv.length, 1);
  assert.equal(inv[0].quantity, 20);
  assert.equal(inv[0].unitCost, 4000);
});

test('clearance price never drops below half of unit cost', () => {
  const p = findProduct('phone_case')!;
  const price = clearanceUnitPrice(p, 100000); // absurdly high cost basis
  assert.ok(price >= 50000);
});

test('clearance price respects custom day sell price', () => {
  const p = findProduct('phone_case')!;
  const base = clearanceUnitPrice(p, 1000);
  const boosted = clearanceUnitPrice(p, 1000, p.sellPrice * 2);
  assert.ok(boosted > base);
});

// — Save normalization —

test('normalizeGameState sanitizes corrupt numbers', () => {
  const corrupt = {
    cash: NaN,
    day: Infinity,
    level: -3,
    xp: NaN,
    reputation: 9999,
    streak: NaN,
  } as unknown as Partial<GameState>;
  const s = normalizeGameState(corrupt);
  assert.ok(Number.isFinite(s.cash));
  assert.ok(Number.isFinite(s.day));
  assert.ok(s.level >= 1);
  assert.ok(s.reputation <= 100);
  assert.equal(s.streak, 0);
});

test('normalizeGameState keeps valid values', () => {
  const valid = { cash: 123456, day: 9, streak: 4, bestStreak: 6 };
  const s = normalizeGameState(valid as Partial<GameState>);
  assert.equal(s.cash, 123456);
  assert.equal(s.day, 9);
  assert.equal(s.streak, 4);
  assert.equal(s.bestStreak, 6);
});

// — Loans (daily settlement) —

test('settleDailyLoans pays down and removes finished loans', () => {
  const state: GameState = {
    ...createInitialState(),
    loans: [
      {
        id: 'l1',
        principal: 10000,
        remainingBalance: 3000,
        dailyPayment: 3000,
        daysRemaining: 1,
        sourceTitle: 'Test',
        sourceTitleEn: 'Test',
      },
      {
        id: 'l2',
        principal: 10000,
        remainingBalance: 9000,
        dailyPayment: 3000,
        daysRemaining: 3,
        sourceTitle: 'Test',
        sourceTitleEn: 'Test',
      },
    ],
  };
  const next = settleDailyLoans(state);
  assert.equal(next.loans.length, 1);
  assert.equal(next.loans[0].remainingBalance, 6000);
});

test('loan payments appear in daily expenses', () => {
  const state: GameState = {
    ...createInitialState(),
    loans: [
      {
        id: 'l1',
        principal: 10000,
        remainingBalance: 5000,
        dailyPayment: 2000,
        daysRemaining: 3,
        sourceTitle: 'Test',
        sourceTitleEn: 'Test',
      },
    ],
  };
  const expenses = calcDailyExpenses(state);
  assert.equal(expenses.loanPayment, 2000);
});

// — Progression / achievements —

test('applyXp handles multi-level-ups', () => {
  const s = applyXp(createInitialState(), 100000);
  assert.ok(s.level > 2);
  assert.ok(s.xp >= 0);
});

test('streak and day achievements unlock', () => {
  const state: GameState = { ...createInitialState(), bestStreak: 7, day: 30 };
  const { state: next, newlyUnlocked } = checkAchievements(state);
  assert.ok(newlyUnlocked.includes('streak_3'));
  assert.ok(newlyUnlocked.includes('streak_7'));
  assert.ok(newlyUnlocked.includes('day_30'));
  assert.ok(next.achievements.includes('streak_7'));
});
