import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustedRate,
  earlyRepayAmount,
  loanOffers,
  MAX_ACTIVE_LOANS,
  repayLoanAction,
  takeLoanAction,
} from '@/game/bank';
import { createInitialState } from '@/game/saveGame';

test('reputation reduces interest rate by up to 40%', () => {
  assert.equal(adjustedRate(0.2, 0), 0.2);
  assert.equal(adjustedRate(0.2, 100), 0.12);
  assert.ok(adjustedRate(0.2, 50) < 0.2);
});

test('taking a loan adds cash and a loan record', () => {
  const state = createInitialState();
  const offer = loanOffers(state)[0];
  const { state: next, result } = takeLoanAction(state, offer.id);
  assert.equal(result.ok, true);
  assert.equal(next.cash, state.cash + offer.principal);
  assert.equal(next.loans.length, 1);
  assert.equal(next.loans[0].remainingBalance, offer.amountDue);
});

test('loan limit is enforced', () => {
  let state = createInitialState();
  const offer = loanOffers(state)[0];
  for (let i = 0; i < MAX_ACTIVE_LOANS; i++) {
    state = takeLoanAction(state, offer.id).state;
  }
  const { result } = takeLoanAction(state, offer.id);
  assert.equal(result.ok, false);
});

test('locked tiers cannot be taken at level 1', () => {
  const state = createInitialState(); // level 1
  const locked = loanOffers(state).find((o) => o.unlockLevel > 1)!;
  const { result } = takeLoanAction(state, locked.id);
  assert.equal(result.ok, false);
});

test('early repayment clears the loan with 3% discount and +1 rep', () => {
  let state = createInitialState();
  const offer = loanOffers(state)[0];
  state = takeLoanAction(state, offer.id).state;
  const loan = state.loans[0];
  const payoff = earlyRepayAmount(loan);
  assert.equal(payoff, Math.round(loan.remainingBalance * 0.97));

  state = { ...state, cash: payoff + 1000 };
  const { state: next, result, paid } = repayLoanAction(state, loan.id);
  assert.equal(result.ok, true);
  assert.equal(paid, payoff);
  assert.equal(next.loans.length, 0);
  assert.equal(next.cash, 1000);
  assert.equal(next.reputation, state.reputation + 1);
});

test('repayment fails without enough cash', () => {
  let state = createInitialState();
  const offer = loanOffers(state)[0];
  state = takeLoanAction(state, offer.id).state;
  state = { ...state, cash: 0 };
  const { result } = repayLoanAction(state, state.loans[0].id);
  assert.equal(result.ok, false);
});
