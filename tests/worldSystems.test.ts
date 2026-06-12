import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, cityBuyFactor, cityDemandFactor, travelToCity } from '@/game/cities';
import {
  addSaturation,
  buyPriceImpact,
  decaySaturation,
  sellRateImpact,
} from '@/game/marketImpact';
import { acceptChance, attemptHaggle } from '@/game/negotiation';
import {
  buyPropertyAction,
  ownsRentFreeFor,
  propertyCapacityBonus,
  propertyDailyIncome,
  PROPERTIES,
} from '@/game/property';
import { currentChapter, evaluateStory, goalMet, STORY_CHAPTERS } from '@/game/story';
import { rollRivalEvent } from '@/game/rivals';
import { calcDailyExpenses, inventoryCapacity } from '@/game/economy';
import { createInitialState } from '@/game/saveGame';
import { runDay } from '@/game/dayCycle';
import { GameState } from '@/types';

// — Cities & travel —

test('travel charges cost, advances day, switches city', () => {
  const state: GameState = { ...createInitialState(), level: 4, cash: 100000 };
  const res = travelToCity(state, 'arusha', () => 0.99); // no loss roll
  assert.ok(res.ok);
  if (res.ok) {
    assert.equal(res.state.currentCityId, 'arusha');
    assert.equal(res.state.cash, 70000);
    assert.equal(res.state.day, state.day + 1);
    assert.equal(res.lostUnits, 0);
  }
});

test('travel is blocked when locked, broke, or already there', () => {
  const base = createInitialState();
  assert.equal(travelToCity(base, 'zanzibar').ok, false); // level locked
  assert.equal(travelToCity({ ...base, level: 8, cash: 0 }, 'zanzibar').ok, false);
  assert.equal(travelToCity(base, 'dar').ok, false); // already here
});

test('travel risk can lose stock', () => {
  const state: GameState = {
    ...createInitialState(),
    level: 8,
    cash: 200000,
    inventory: [{ productId: 'phone_case', quantity: 100, unitCost: 3000 }],
  };
  const res = travelToCity(state, 'zanzibar', () => 0.01); // force the loss roll
  assert.ok(res.ok);
  if (res.ok) assert.ok(res.lostUnits > 0);
});

test('city factors are sane', () => {
  assert.ok(cityBuyFactor('zanzibar', 'imported') < 1);
  assert.equal(cityBuyFactor('dar', 'food'), 1);
  assert.ok(cityDemandFactor('zanzibar') > 1);
  assert.equal(cityDemandFactor('unknown_city'), 1);
  for (const c of CITIES) {
    Object.values(c.buyFactors).forEach((f) => assert.ok((f ?? 1) > 0.5 && (f ?? 1) <= 1));
  }
});

// — Market saturation —

test('saturation raises buy price and slows sales, capped', () => {
  assert.equal(buyPriceImpact(0), 1);
  assert.ok(buyPriceImpact(100) > 1);
  assert.equal(buyPriceImpact(10000), 1.15);
  assert.equal(sellRateImpact(0), 1);
  assert.equal(sellRateImpact(10000), 0.75);
});

test('saturation accumulates and decays', () => {
  let map = addSaturation({}, 'phone_case', 50);
  map = addSaturation(map, 'phone_case', 30);
  assert.equal(map.phone_case, 80);
  const decayed = decaySaturation(map);
  assert.equal(decayed.phone_case, 56);
  // fully decays to nothing eventually
  let m = { x: 2 };
  m = decaySaturation(m) as { x: number };
  assert.equal(m.x, undefined);
});

// — Negotiation —

test('haggle odds: reputation helps, rounds hurt, bounded', () => {
  assert.ok(acceptChance(5, 100, 1) > acceptChance(5, 0, 1));
  assert.ok(acceptChance(10, 50, 1) > acceptChance(10, 50, 3));
  assert.ok(acceptChance(15, 0, 3) >= 0.05);
  assert.ok(acceptChance(5, 100, 1) <= 0.9);
});

test('haggle outcomes are deterministic given rolls', () => {
  // first roll < offend chance → offended
  const offended = attemptHaggle(15, 0, 3, () => 0.001);
  assert.equal(offended.result, 'offended');
  // high offend roll, then low accept roll → accepted
  const rolls = [0.99, 0.01];
  const accepted = attemptHaggle(5, 50, 1, () => rolls.shift() ?? 0.99);
  assert.equal(accepted.result, 'accepted');
  // high rolls → counter at half the ask
  const counter = attemptHaggle(10, 0, 1, () => 0.99);
  assert.equal(counter.result, 'counter');
  if (counter.result === 'counter') assert.equal(counter.discountPercent, 5);
});

// — Property —

test('buying property: gating, rent removal, capacity, income', () => {
  let state: GameState = { ...createInitialState(), level: 9, cash: 5000000 };
  assert.equal(buyPropertyAction(state, 'stall_kariakoo').result.ok, true);
  state = buyPropertyAction(state, 'stall_kariakoo').state;
  assert.ok(ownsRentFreeFor(state, 'kariakoo_table'));
  assert.equal(calcDailyExpenses(state).rent, 0);
  assert.equal(buyPropertyAction(state, 'stall_kariakoo').result.ok, false); // already owned

  const capBefore = inventoryCapacity(state);
  state = buyPropertyAction(state, 'godown_ilala').state;
  assert.equal(inventoryCapacity(state), capBefore + 25);
  assert.equal(propertyCapacityBonus(state), 25);

  state = buyPropertyAction(state, 'building_kariakoo').state;
  assert.equal(propertyDailyIncome(state), 28000);
});

test('property income flows through the day cycle', () => {
  const state: GameState = {
    ...createInitialState(),
    level: 9,
    ownedProperties: ['building_kariakoo'],
  };
  const result = runDay(state, { rollEventFn: () => undefined });
  assert.equal(result.report.propertyIncome, 28000);
  assert.ok(result.state.cash > state.cash); // income even with no sales
});

// — Story —

test('story chapters complete in order with rewards', () => {
  let state = createInitialState();
  assert.equal(currentChapter(state)?.id, 'ch1_mama');
  // not met yet
  assert.equal(evaluateStory(state).completedChapter, undefined);
  // make the first sale
  state = { ...state, hasMadeFirstSale: true };
  const evaluated = evaluateStory(state);
  assert.equal(evaluated.completedChapter?.id, 'ch1_mama');
  assert.equal(evaluated.state.cash, state.cash + 10000);
  assert.equal(currentChapter(evaluated.state)?.id, 'ch2_jirani');
  // only one chapter per evaluation even if both goals are met
  const both = evaluateStory({ ...evaluated.state, totalRevenue: 999999999 });
  assert.equal(both.completedChapter?.id, 'ch2_jirani');
});

test('every story goal type evaluates without crashing', () => {
  const state = createInitialState();
  for (const ch of STORY_CHAPTERS) {
    assert.equal(typeof goalMet(state, ch.goal), 'boolean');
  }
});

// — Rival events —

test('rival events respect conditions', () => {
  const noWorkers = { ...createInitialState(), level: 10 };
  // forced trigger roll, then deterministic pick across many rolls:
  for (let i = 0; i < 20; i++) {
    const e = rollRivalEvent(noWorkers, () => 0.01);
    assert.notEqual(e?.id, 'rival_juma_poach'); // can't poach who you don't have
  }
  // no trigger when roll is high
  assert.equal(rollRivalEvent(noWorkers, () => 0.99), undefined);
});
