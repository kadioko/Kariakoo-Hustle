import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '@/game/saveGame';
import { simulateDay } from '@/game/salesSimulation';
import { buildReportInsights } from '@/game/reportInsights';
import { DailyReport } from '@/types';

test('sales breakdown attributes returns and quality loss to the product', () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    const state = createInitialState();
    state.inventory = [{
      productId: 'smart_watch',
      quantity: 100,
      unitCost: 30000,
      qualityReturnMultiplier: 1.65,
    }];

    const outcome = simulateDay(state, 'aggressive');
    const item = outcome.perProduct[0];

    assert.ok(outcome.returnedUnits > 0);
    assert.equal(item.returned, outcome.returnedUnits);
    assert.equal(item.qualityLoss, outcome.qualityLoss);
  } finally {
    Math.random = originalRandom;
  }
});

test('report insight names the product responsible for quality returns', () => {
  const state = createInitialState();
  const report: DailyReport = {
    day: 1,
    revenue: 50000,
    cogs: 30000,
    grossProfit: 20000,
    expenses: 3000,
    netProfit: 17000,
    unitsSold: 5,
    returnedUnits: 2,
    qualityLoss: 20000,
    unitsRemaining: 3,
    reputationChange: -1,
    salesBreakdown: [{ productId: 'smart_watch', sold: 5, revenue: 50000, returned: 2, qualityLoss: 20000 }],
    advice: 'Sawa',
    adviceEn: 'Good',
  };

  const insight = buildReportInsights(state, report);
  assert.match(insight.whatHurt ?? '', /Smart Watch/);
  assert.match(insight.whatHurtEn ?? '', /Smart Watches/);
});
