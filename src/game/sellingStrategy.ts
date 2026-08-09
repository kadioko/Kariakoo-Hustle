import { PRODUCTS } from '@/data/products';
import { GameState } from '@/types';
import { calcDailyExpenses } from './economy';

export type SellingStrategy = 'safe' | 'balanced' | 'aggressive';

export interface SellingStrategyInfo {
  id: SellingStrategy;
  emoji: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  effect: string;
  effectEn: string;
}

export const SELLING_STRATEGIES: SellingStrategyInfo[] = [
  {
    id: 'safe',
    emoji: 'S',
    name: 'Uuzaji Salama',
    nameEn: 'Safe Selling',
    description: 'Linda sifa na quality. Mauzo yatakuwa ya tahadhari.',
    descriptionEn: 'Protect reputation and quality. Sales are more cautious.',
    effect: '-10% demand, -35% returns',
    effectEn: '-10% demand, -35% returns',
  },
  {
    id: 'balanced',
    emoji: 'B',
    name: 'Uuzaji wa Kawaida',
    nameEn: 'Balanced Selling',
    description: 'Mchanganyiko wa mauzo, risk na faida.',
    descriptionEn: 'A steady mix of sales, risk, and profit.',
    effect: 'Hakuna mabadiliko',
    effectEn: 'No modifier',
  },
  {
    id: 'aggressive',
    emoji: 'A',
    name: 'Uuzaji wa Kasi',
    nameEn: 'Aggressive Selling',
    description: 'Vuta wateja wengi, lakini risk ya returns inapanda.',
    descriptionEn: 'Chase more customers, but returns become more likely.',
    effect: '+15% demand, +35% returns',
    effectEn: '+15% demand, +35% returns',
  },
];

export const sellingStrategyInfo = (id: SellingStrategy): SellingStrategyInfo =>
  SELLING_STRATEGIES.find((strategy) => strategy.id === id) ?? SELLING_STRATEGIES[1];

/** Suggests a strategy from the business situation, without forcing the choice. */
export function recommendSellingStrategy(state: GameState): SellingStrategy {
  const expenses = calcDailyExpenses(state).total;
  const runway = expenses > 0 ? state.cash / expenses : 99;
  const hasRiskyStock = state.inventory.some((item) => {
    const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
    return product?.risk === 'high';
  });
  const stockUnits = state.inventory.reduce((sum, item) => sum + item.quantity, 0);
  const budgetQualityUnits = state.inventory.reduce(
    (sum, item) => sum + ((item.qualityReturnMultiplier ?? 1) >= 1.3 ? item.quantity : 0),
    0,
  );
  const hasBudgetQualityPressure = stockUnits > 0 && budgetQualityUnits / stockUnits >= 0.3;

  if (hasRiskyStock || hasBudgetQualityPressure || state.reputation < 0) return 'safe';
  if (runway < 3 || state.cash < 15000) return 'aggressive';
  return 'balanced';
}
