import { REWARDED_AD_OPTIONS, RewardedAdType } from '@/data/monetization';
import { PRODUCTS } from '@/data/products';
import { DailyReport, GameState, MarketInsiderTip } from '@/types';
import { getProductInsight } from './productInsights';

const DAILY_PROFIT_BONUS_CAP = 50000;
const BAD_TRADE_RECOVERY_RATE = 0.35;
const BAD_TRADE_RECOVERY_CAP = 75000;

export interface AdRewardClaimResult {
  ok: boolean;
  reason?: 'already_claimed' | 'no_report' | 'not_eligible' | 'unknown_reward';
  cashAwarded?: number;
  tip?: MarketInsiderTip;
  message: string;
  messageEn: string;
}

function latestReport(state: GameState): DailyReport | undefined {
  return state.reports[0];
}

export function adRewardClaimKey(state: GameState, type: RewardedAdType): string {
  const report = latestReport(state);
  const dayKey =
    type === 'double_daily_profit' || type === 'bad_trade_recovery'
      ? report?.day ?? state.day
      : state.day;
  return `${type}:${dayKey}`;
}

function hasClaimed(state: GameState, type: RewardedAdType): boolean {
  return state.adRewardClaims.includes(adRewardClaimKey(state, type));
}

function markClaimed(state: GameState, type: RewardedAdType): GameState {
  const key = adRewardClaimKey(state, type);
  return state.adRewardClaims.includes(key)
    ? state
    : { ...state, adRewardClaims: [...state.adRewardClaims, key] };
}

function claimFailure(reason: AdRewardClaimResult['reason'], message: string, messageEn: string): {
  state: GameState;
  result: AdRewardClaimResult;
} {
  return {
    state: undefined as unknown as GameState,
    result: { ok: false, reason, message, messageEn },
  };
}

function marketTipFor(state: GameState): MarketInsiderTip | undefined {
  const unlocked = PRODUCTS.filter((product) => product.unlockLevel <= state.level);
  const ranked = unlocked
    .map((product) => ({
      product,
      insight: getProductInsight(product, state.settings.language),
    }))
    .sort((a, b) => b.insight.score - a.insight.score || b.insight.marginPercent - a.insight.marginPercent);
  const pick = ranked[0];
  if (!pick) return undefined;

  return {
    day: state.day,
    productId: pick.product.id,
    title: `Tip ya Soko: ${pick.product.name}`,
    titleEn: `Market Tip: ${pick.product.nameEn}`,
    message: `${pick.insight.label}: ${pick.insight.description} Margin ni takriban ${pick.insight.marginPercent}%.`,
    messageEn: `${pick.insight.label}: ${pick.insight.description} Margin is about ${pick.insight.marginPercent}%.`,
  };
}

export function claimRewardedAdReward(
  state: GameState,
  type: RewardedAdType,
): { state: GameState; result: AdRewardClaimResult } {
  if (!REWARDED_AD_OPTIONS.some((option) => option.id === type)) {
    const failure = claimFailure(
      'unknown_reward',
      'Reward haijatambulika.',
      'Unknown reward.',
    );
    return { ...failure, state };
  }

  if (hasClaimed(state, type)) {
    const failure = claimFailure(
      'already_claimed',
      'Reward hii tayari imetumika kwa siku hii.',
      'This reward has already been claimed for this day.',
    );
    return { ...failure, state };
  }

  const report = latestReport(state);

  if (type === 'double_daily_profit') {
    if (!report) {
      const failure = claimFailure(
        'no_report',
        'Maliza siku kwanza ndipo bonus ya faida ipatikane.',
        'End the day first before claiming a profit bonus.',
      );
      return { ...failure, state };
    }
    if (report.netProfit <= 0) {
      const failure = claimFailure(
        'not_eligible',
        'Bonus hii inahitaji siku yenye faida.',
        'This bonus needs a profitable day.',
      );
      return { ...failure, state };
    }
    const cashAwarded = Math.min(report.netProfit, DAILY_PROFIT_BONUS_CAP);
    const next = markClaimed(
      {
        ...state,
        cash: state.cash + cashAwarded,
      },
      type,
    );
    return {
      state: next,
      result: {
        ok: true,
        cashAwarded,
        message: `Umeongeza bonus ya ${cashAwarded.toLocaleString()} TZS. Faida halisi bado inatoka kwenye biashara.`,
        messageEn: `Added a ${cashAwarded.toLocaleString()} TZS bonus. Real growth still comes from the business.`,
      },
    };
  }

  if (type === 'market_insider_tip') {
    const tip = marketTipFor(state);
    if (!tip) {
      const failure = claimFailure(
        'not_eligible',
        'Hakuna bidhaa ya kutosha kwa tip leo.',
        'No eligible product tip is available today.',
      );
      return { ...failure, state };
    }
    const next = markClaimed({ ...state, lastMarketInsiderTip: tip }, type);
    return {
      state: next,
      result: {
        ok: true,
        tip,
        message: tip.message,
        messageEn: tip.messageEn,
      },
    };
  }

  if (type === 'speed_delivery') {
    const next = markClaimed(
      {
        ...state,
        deliverySpeedUntilDay: Math.max(state.deliverySpeedUntilDay, state.day + 1),
      },
      type,
    );
    return {
      state: next,
      result: {
        ok: true,
        message: 'Delivery na selling presentation zitakuwa faster kwa siku inayofuata.',
        messageEn: 'Delivery and selling presentation will run faster through the next day.',
      },
    };
  }

  if (type === 'bad_trade_recovery') {
    if (!report) {
      const failure = claimFailure(
        'no_report',
        'Unahitaji ripoti ya siku yenye hasara kwanza.',
        'You need a daily report with a loss first.',
      );
      return { ...failure, state };
    }
    const lossBase = Math.max(0, -report.netProfit, report.qualityLoss ?? 0);
    if (lossBase <= 0) {
      const failure = claimFailure(
        'not_eligible',
        'Hakuna bad trade ya kurecover kwa ripoti ya mwisho.',
        'There is no bad trade to recover from in the latest report.',
      );
      return { ...failure, state };
    }
    const cashAwarded = Math.min(
      BAD_TRADE_RECOVERY_CAP,
      Math.max(1000, Math.round(lossBase * BAD_TRADE_RECOVERY_RATE)),
    );
    const next = markClaimed(
      {
        ...state,
        cash: state.cash + cashAwarded,
        adRecoveryTotal: state.adRecoveryTotal + cashAwarded,
      },
      type,
    );
    return {
      state: next,
      result: {
        ok: true,
        cashAwarded,
        message: `Umerudisha ${cashAwarded.toLocaleString()} TZS tu. Hasara bado ibaki somo.`,
        messageEn: `Recovered ${cashAwarded.toLocaleString()} TZS only. The loss still remains a lesson.`,
      },
    };
  }

  const failure = claimFailure('unknown_reward', 'Reward haijatambulika.', 'Unknown reward.');
  return { ...failure, state };
}
