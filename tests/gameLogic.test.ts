import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTING_CASH, addInventory, inventoryCapacity, inventoryUnits, netWorth, removeInventoryUnits, settleDailyLoans } from '../src/game/economy';
import { SAVE_VERSION, createInitialState, normalizeGameState } from '../src/game/saveGame';
import { applyXp, xpForLevel } from '../src/game/progression';
import { generateDailyMissions } from '../src/game/missions';
import { findCashCheat, normalizeCheatCode } from '../src/game/cheats';
import { buyUpgradeAction, hireWorkerAction, unlockLocationAction } from '../src/game/businessActions';
import { ADS_ENABLED, COSMETIC_THEMES, REWARDED_AD_OPTIONS } from '../src/data/monetization';

test('initial state matches first-session economy expectations', () => {
  const state = createInitialState();

  assert.equal(state.cash, STARTING_CASH);
  assert.equal(state.day, 1);
  assert.equal(state.level, 1);
  assert.equal(state.settings.language, 'sw');
  assert.equal(state.currentLocationId, 'kariakoo_table');
  assert.equal(inventoryCapacity(state), 30);
});

test('inventory helpers blend costs and remove stock safely', () => {
  const inventory = addInventory(
    addInventory([], 'phone_case', 4, 3000),
    'phone_case',
    2,
    4500,
  );

  assert.deepEqual(inventory, [{ productId: 'phone_case', quantity: 6, unitCost: 3500 }]);
  assert.equal(inventoryUnits({ ...createInitialState(), inventory }), 6);
  assert.deepEqual(removeInventoryUnits(inventory, 'phone_case', 10), []);
});

test('xp applies level ups with rollover xp', () => {
  const state = createInitialState();
  const next = applyXp(state, xpForLevel(1) + 10);

  assert.equal(next.level, 2);
  assert.equal(next.xp, 10);
});

test('normalizes save versions 1 through current version', () => {
  for (let version = 1; version <= SAVE_VERSION; version += 1) {
    const normalized = normalizeGameState({
      saveVersion: version,
      cash: 123456,
      day: 4,
      settings: { language: 'en', sound: false, vibration: false },
    });

    assert.equal(normalized.saveVersion, SAVE_VERSION);
    assert.equal(normalized.cash, 123456);
    assert.equal(normalized.day, 4);
    assert.equal(normalized.settings.language, 'en');
    assert.ok(Array.isArray(normalized.missions));
    assert.ok(Array.isArray(normalized.completedMissionIds));
    assert.ok(Array.isArray(normalized.loans));
  }
});

test('missing mission data is regenerated during migration', () => {
  const normalized = normalizeGameState({ day: 8, level: 3, missions: [] });

  assert.equal(normalized.missions.length, generateDailyMissions(8, 3).length);
  assert.ok(normalized.missions.every((mission) => mission.day === 8));
});

test('loan balances reduce net worth and settle over days', () => {
  const state = {
    ...createInitialState(),
    cash: 100000,
    loans: [
      {
        id: 'test_loan',
        principal: 50000,
        remainingBalance: 60000,
        dailyPayment: 20000,
        daysRemaining: 3,
        sourceTitle: 'Mtihani',
        sourceTitleEn: 'Test',
      },
    ],
  };

  assert.equal(netWorth(state), 40000);
  const afterPayment = settleDailyLoans(state);
  assert.equal(afterPayment.loans[0]?.remainingBalance, 40000);
  assert.equal(afterPayment.loans[0]?.daysRemaining, 2);
});

test('cash cheat codes normalize and return expected test amounts', () => {
  assert.equal(normalizeCheatCode(' kari oo 50k '), 'KARIOO50K');
  assert.equal(findCashCheat('KARIOO50K')?.amount, 50000);
  assert.equal(findCashCheat('karioo2m5')?.amount, 2500000);
  assert.equal(findCashCheat('EMPIRE30M')?.amount, 30000000);
});

test('upgrade purchase mutates cash and owned upgrades', () => {
  const state = { ...createInitialState(), cash: 100000, level: 2 };
  const outcome = buyUpgradeAction(state, 'bigger_table');

  assert.equal(outcome.result.ok, true);
  assert.equal(outcome.state.upgrades.includes('bigger_table'), true);
  assert.equal(outcome.state.cash, 75000);
});

test('worker hiring respects level and then mutates cash and workers', () => {
  const locked = hireWorkerAction({ ...createInitialState(), cash: 100000, level: 1 }, 'sales_assistant');
  assert.deepEqual(locked.result, { ok: false, reason: 'not_unlocked' });

  const hired = hireWorkerAction({ ...createInitialState(), cash: 100000, level: 2 }, 'sales_assistant');
  assert.equal(hired.result.ok, true);
  assert.equal(hired.state.workers.includes('sales_assistant'), true);
  assert.equal(hired.state.cash, 94000);
});

test('location unlock switches current location and charges unlock cost', () => {
  const outcome = unlockLocationAction({ ...createInitialState(), cash: 500000 }, 'kariakoo_small_shop');

  assert.equal(outcome.result.ok, true);
  assert.equal(outcome.state.locations.includes('kariakoo_small_shop'), true);
  assert.equal(outcome.state.currentLocationId, 'kariakoo_small_shop');
  assert.equal(outcome.state.cash, 200000);
});

test('monetization placeholders stay fair and disabled', () => {
  assert.equal(ADS_ENABLED, false);
  assert.deepEqual(
    REWARDED_AD_OPTIONS.map((option) => option.id),
    ['daily_bonus', 'bad_event_recovery', 'speed_selling', 'supplier_tip'],
  );
  assert.deepEqual(
    COSMETIC_THEMES.map((theme) => theme.id),
    ['kariakoo_classic', 'modern_duka', 'wholesale_boss', 'zanzibar_branch'],
  );
  assert.equal(REWARDED_AD_OPTIONS.some((option) => option.id.includes('remove_ads')), false);
});
