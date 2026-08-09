import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '@/game/saveGame';
import { tomorrowPlan } from '@/game/tomorrowPlan';
import { DailyReport } from '@/types';

function report(overrides: Partial<DailyReport> = {}): DailyReport {
  return {
    day: 1,
    revenue: 30000,
    cogs: 15000,
    grossProfit: 15000,
    expenses: 3000,
    netProfit: 12000,
    unitsSold: 5,
    unitsRemaining: 4,
    reputationChange: 1,
    advice: 'Sawa',
    adviceEn: 'Good',
    ...overrides,
  };
}

test('tomorrow plan reacts to quality losses with supplier advice', () => {
  const plan = tomorrowPlan(createInitialState(), report({ qualityLoss: 8000, returnedUnits: 2 }));

  assert.equal(plan.length, 3);
  assert.equal(plan[0].id, 'protect_quality');
  assert.equal(plan[0].route, 'Market');
});

test('tomorrow plan prioritizes slow stock and loss review', () => {
  const plan = tomorrowPlan(
    createInitialState(),
    report({ netProfit: -5000, worstSellerId: 'socks', unitsSold: 2, unitsRemaining: 12 }),
  );

  assert.ok(plan.some((action) => action.id === 'rotate_stock'));
  assert.ok(plan.some((action) => action.id === 'review_loss'));
  assert.equal(new Set(plan.map((action) => action.route)).size, plan.length);
});

test('tomorrow plan recommends a careful restock after a healthy day', () => {
  const state = { ...createInitialState(), cash: 100000 };
  const plan = tomorrowPlan(state, report({ bestSellerId: 'phone_case' }));

  assert.ok(plan.some((action) => action.id === 'restock_winner'));
});
