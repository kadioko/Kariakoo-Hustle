import { GameState, Loan } from '@/types';

export const MAX_ACTIVE_LOANS = 2;

export interface LoanOffer {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  principal: number;
  /** Total interest as a fraction of principal (already reputation-adjusted) */
  interestRate: number;
  amountDue: number;
  termDays: number;
  dailyPayment: number;
  unlockLevel: number;
  description: string;
  descriptionEn: string;
}

interface OfferTemplate {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  principal: number;
  baseRate: number;
  termDays: number;
  unlockLevel: number;
  description: string;
  descriptionEn: string;
}

const TEMPLATES: OfferTemplate[] = [
  {
    id: 'kikundi',
    name: 'Mkopo wa Kikundi',
    nameEn: 'Savings Group Loan',
    emoji: '🤝',
    principal: 30000,
    baseRate: 0.15,
    termDays: 5,
    unlockLevel: 1,
    description: 'Mkopo mdogo wa haraka kutoka kikundi cha akiba.',
    descriptionEn: 'Quick small loan from a local savings group.',
  },
  {
    id: 'mobile',
    name: 'Mkopo wa Simu',
    nameEn: 'Mobile Money Loan',
    emoji: '📱',
    principal: 100000,
    baseRate: 0.18,
    termDays: 7,
    unlockLevel: 3,
    description: 'Mkopo wa kati kupitia simu. Riba ya wastani.',
    descriptionEn: 'Mid-size mobile money loan. Moderate interest.',
  },
  {
    id: 'sacco',
    name: 'Mkopo wa SACCO',
    nameEn: 'SACCO Business Loan',
    emoji: '🏦',
    principal: 300000,
    baseRate: 0.2,
    termDays: 10,
    unlockLevel: 5,
    description: 'Mkopo mkubwa wa biashara. Unahitaji sifa nzuri.',
    descriptionEn: 'Large business loan. Good reputation pays off.',
  },
];

/** Reputation 0–100 shaves up to 40% off the base interest rate. */
export function adjustedRate(baseRate: number, reputation: number): number {
  const repFactor = 1 - Math.max(0, Math.min(100, reputation)) / 100 * 0.4;
  return Math.round(baseRate * repFactor * 1000) / 1000;
}

export function loanOffers(state: GameState): LoanOffer[] {
  return TEMPLATES.map((tpl) => {
    const rate = adjustedRate(tpl.baseRate, state.reputation);
    const amountDue = Math.round(tpl.principal * (1 + rate));
    return {
      id: tpl.id,
      name: tpl.name,
      nameEn: tpl.nameEn,
      emoji: tpl.emoji,
      principal: tpl.principal,
      interestRate: rate,
      amountDue,
      termDays: tpl.termDays,
      dailyPayment: Math.ceil(amountDue / tpl.termDays),
      unlockLevel: tpl.unlockLevel,
      description: tpl.description,
      descriptionEn: tpl.descriptionEn,
    };
  });
}

export type BankActionResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'not_unlocked' | 'too_many_loans' | 'not_enough_cash' };

export function takeLoanAction(
  state: GameState,
  offerId: string,
): { state: GameState; result: BankActionResult } {
  const offer = loanOffers(state).find((o) => o.id === offerId);
  if (!offer) return { state, result: { ok: false, reason: 'not_found' } };
  if (state.level < offer.unlockLevel) return { state, result: { ok: false, reason: 'not_unlocked' } };
  if (state.loans.length >= MAX_ACTIVE_LOANS) {
    return { state, result: { ok: false, reason: 'too_many_loans' } };
  }

  const loan: Loan = {
    id: `bank_${offer.id}_d${state.day}_${state.loans.length}`,
    principal: offer.principal,
    remainingBalance: offer.amountDue,
    dailyPayment: offer.dailyPayment,
    daysRemaining: offer.termDays,
    sourceTitle: offer.name,
    sourceTitleEn: offer.nameEn,
  };

  return {
    state: { ...state, cash: state.cash + offer.principal, loans: [...state.loans, loan] },
    result: { ok: true },
  };
}

/** Early full repayment with a 3% discount on the remaining balance. */
export function earlyRepayAmount(loan: Loan): number {
  return Math.round(loan.remainingBalance * 0.97);
}

export function repayLoanAction(
  state: GameState,
  loanId: string,
): { state: GameState; result: BankActionResult; paid?: number } {
  const loan = state.loans.find((l) => l.id === loanId);
  if (!loan) return { state, result: { ok: false, reason: 'not_found' } };
  const payoff = earlyRepayAmount(loan);
  if (state.cash < payoff) return { state, result: { ok: false, reason: 'not_enough_cash' } };

  return {
    state: {
      ...state,
      cash: state.cash - payoff,
      loans: state.loans.filter((l) => l.id !== loanId),
      reputation: Math.min(100, state.reputation + 1),
    },
    result: { ok: true },
    paid: payoff,
  };
}
