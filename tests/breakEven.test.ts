import assert from 'node:assert/strict';
import test from 'node:test';
import { breakEvenSnapshot } from '@/game/breakEven';
import { addInventory } from '@/game/economy';
import { createInitialState } from '@/game/saveGame';

test('break-even snapshot identifies an empty shop', () => {
  const snapshot = breakEvenSnapshot(createInitialState());
  assert.equal(snapshot.status, 'no_stock');
  assert.equal(snapshot.availableUnits, 0);
});

test('break-even target uses current stock margins', () => {
  const state = createInitialState();
  state.inventory = addInventory([], 'phone_case', 10, 3000, 1);
  const snapshot = breakEvenSnapshot(state);

  assert.equal(snapshot.status, 'possible');
  assert.ok(snapshot.averageUnitMargin > 0);
  assert.ok(snapshot.unitsNeeded > 0 && snapshot.unitsNeeded <= snapshot.availableUnits);
});

test('property income can cover operating costs before sales', () => {
  const state = createInitialState();
  state.ownedProperties = ['duka_uswahilini'];
  const snapshot = breakEvenSnapshot(state);

  assert.equal(snapshot.status, 'covered');
  assert.equal(snapshot.unitsNeeded, 0);
});

test('break-even snapshot exposes risky blended supplier quality', () => {
  const state = createInitialState();
  state.inventory = addInventory([], 'phone_case', 10, 2500, 1, 1.65);
  assert.ok(breakEvenSnapshot(state).averageQualityRisk > 1.3);
});
