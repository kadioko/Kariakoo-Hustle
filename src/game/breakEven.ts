import { findProduct } from '@/data/products';
import { GameState } from '@/types';
import { calcDailyExpenses, inventoryUnits } from './economy';
import { dayPriceFor } from './marketPrices';
import { propertyDailyIncome } from './property';

export type BreakEvenStatus = 'covered' | 'possible' | 'unlikely' | 'no_stock';

export interface BreakEvenSnapshot {
  fixedCosts: number;
  propertyIncome: number;
  contributionNeeded: number;
  averageUnitMargin: number;
  unitsNeeded: number;
  availableUnits: number;
  averageQualityRisk: number;
  status: BreakEvenStatus;
}

/** A deterministic pre-sale target; random events and streak bonuses are excluded. */
export function breakEvenSnapshot(state: GameState): BreakEvenSnapshot {
  const fixedCosts = calcDailyExpenses(state).total;
  const propertyIncome = propertyDailyIncome(state);
  const contributionNeeded = Math.max(0, fixedCosts - propertyIncome);
  const availableUnits = inventoryUnits(state);

  let totalMargin = 0;
  let weightedQuality = 0;
  let pricedUnits = 0;
  state.inventory.forEach((item) => {
    const product = findProduct(item.productId);
    if (!product) return;
    const sellPrice = dayPriceFor(product, state.day).sellPrice;
    totalMargin += Math.max(0, sellPrice - item.unitCost) * item.quantity;
    weightedQuality += (item.qualityReturnMultiplier ?? 1) * item.quantity;
    pricedUnits += item.quantity;
  });

  const averageUnitMargin = pricedUnits > 0 ? Math.round(totalMargin / pricedUnits) : 0;
  const averageQualityRisk = pricedUnits > 0 ? weightedQuality / pricedUnits : 1;
  const unitsNeeded = contributionNeeded === 0
    ? 0
    : averageUnitMargin > 0
      ? Math.ceil(contributionNeeded / averageUnitMargin)
      : Number.POSITIVE_INFINITY;

  let status: BreakEvenStatus;
  if (contributionNeeded === 0) status = 'covered';
  else if (availableUnits === 0) status = 'no_stock';
  else if (!Number.isFinite(unitsNeeded) || unitsNeeded > availableUnits) status = 'unlikely';
  else status = 'possible';

  return {
    fixedCosts,
    propertyIncome,
    contributionNeeded,
    averageUnitMargin,
    unitsNeeded,
    availableUnits,
    averageQualityRisk,
    status,
  };
}
