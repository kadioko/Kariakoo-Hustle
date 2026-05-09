import { Demand, GameState, InventoryItem, Product, Risk } from '@/types';
import { findProduct } from '@/data/products';
import { findLocation } from '@/data/locations';
import { UPGRADES } from '@/data/upgrades';
import { WORKERS } from '@/data/workers';

// Sell rates: slightly more generous early so players feel momentum
const DEMAND_BASE: Record<Demand, number> = {
  low: 0.2,
  medium: 0.38,
  high: 0.55,
  very_high: 0.75,
};

const RETURN_BASE: Record<Risk, number> = {
  low: 0.01,
  medium: 0.04,
  high: 0.08,
};

export interface SalesOutcome {
  newInventory: InventoryItem[];
  revenue: number;
  cogs: number;
  unitsSold: number;
  returnedUnits: number;
  qualityLoss: number;
  unitsRemaining: number;
  bestSellerId?: string;
  worstSellerId?: string;
  perProduct: { productId: string; sold: number; revenue: number }[];
}

function aggregateBoosts(state: GameState) {
  let salesBoost = 0;
  let demandBoost = 0;
  let qualityProtection = 0;

  state.upgrades.forEach((id) => {
    const u = UPGRADES.find((x) => x.id === id);
    if (!u) return;
    salesBoost += u.effects.salesBoostPercent ?? 0;
    demandBoost += u.effects.demandBoostPercent ?? 0;
    qualityProtection += u.effects.eventLossReductionPercent ?? 0;
  });
  state.workers.forEach((id) => {
    const w = WORKERS.find((x) => x.id === id);
    if (!w) return;
    salesBoost += w.effects.salesBoostPercent ?? 0;
    demandBoost += w.effects.demandBoostPercent ?? 0;
    qualityProtection += w.effects.inventoryLossReductionPercent ?? 0;
    qualityProtection += w.effects.eventLossReductionPercent ?? 0;
  });

  const loc = findLocation(state.currentLocationId);
  const locationMult = loc?.demandMultiplier ?? 1;

  const repBoost = Math.max(-0.2, Math.min(0.3, state.reputation * 0.01));

  return {
    salesMultiplier: 1 + salesBoost,
    demandMultiplier: (1 + demandBoost) * locationMult * (1 + repBoost),
    qualityProtection: Math.min(0.75, qualityProtection),
  };
}

function returnedUnitsForSale(product: Product, sold: number, protection: number): number {
  if (sold <= 0) return 0;
  const variance = 0.75 + Math.random() * 0.6;
  const returnRate = RETURN_BASE[product.risk] * (1 - protection) * variance;
  const expected = sold * returnRate;
  const guaranteed = Math.floor(expected);
  const extra = Math.random() < expected - guaranteed ? 1 : 0;
  return Math.min(sold, guaranteed + extra);
}

export function simulateDay(state: GameState): SalesOutcome {
  const { salesMultiplier, demandMultiplier, qualityProtection } = aggregateBoosts(state);

  const newInventory: InventoryItem[] = [];
  const perProduct: SalesOutcome['perProduct'] = [];
  let revenue = 0;
  let cogs = 0;
  let unitsSold = 0;
  let returnedUnits = 0;
  let qualityLoss = 0;

  for (const item of state.inventory) {
    const product = findProduct(item.productId);
    if (!product) {
      newInventory.push(item);
      continue;
    }
    const baseRate = DEMAND_BASE[product.demand];
    const variance = 0.80 + Math.random() * 0.45; // 0.80 - 1.25 (wider positive skew)
    const sellRate = Math.min(1, baseRate * salesMultiplier * demandMultiplier * variance);
    const sold = Math.min(item.quantity, Math.floor(item.quantity * sellRate));

    const returned = returnedUnitsForSale(product, sold, qualityProtection);
    const netSold = sold - returned;

    if (sold > 0) {
      const r = netSold * product.sellPrice;
      const loss = returned * product.sellPrice;
      revenue += r;
      cogs += sold * item.unitCost;
      unitsSold += netSold;
      returnedUnits += returned;
      qualityLoss += loss;
      if (netSold > 0) {
        perProduct.push({ productId: item.productId, sold: netSold, revenue: r });
      }
    }
    const remaining = item.quantity - sold;
    if (remaining > 0) {
      newInventory.push({ ...item, quantity: remaining });
    }
  }

  let bestSellerId: string | undefined;
  let worstSellerId: string | undefined;
  if (perProduct.length > 0) {
    const sorted = [...perProduct].sort((a, b) => b.sold - a.sold);
    bestSellerId = sorted[0].productId;
    if (sorted.length > 1) worstSellerId = sorted[sorted.length - 1].productId;
  }

  const unitsRemaining = newInventory.reduce((s, i) => s + i.quantity, 0);

  return {
    newInventory,
    revenue: Math.round(revenue),
    cogs: Math.round(cogs),
    unitsSold,
    returnedUnits,
    qualityLoss: Math.round(qualityLoss),
    unitsRemaining,
    bestSellerId,
    worstSellerId,
    perProduct,
  };
}

export function reputationDeltaFromDay(
  state: GameState,
  outcome: SalesOutcome,
): number {
  let d = 0;
  if (outcome.unitsSold > 0) d += 1;
  if (outcome.revenue > 100000) d += 1;
  if (outcome.returnedUnits > 0) d -= Math.min(2, Math.ceil(outcome.returnedUnits / 3));
  // Lots of unsold stock damages a tiny bit
  const totalStart =
    outcome.unitsSold + outcome.unitsRemaining;
  if (totalStart > 0 && outcome.unitsSold / totalStart < 0.1) d -= 1;
  return d;
}

export function adviceForDay(
  state: GameState,
  outcome: SalesOutcome,
  netProfit: number,
): { sw: string; en: string } {
  if (outcome.unitsSold === 0) {
    return {
      sw: 'Boss, hakuna mauzo leo. Nunua mzigo unaohitajika sokoni au boresha duka.',
      en: 'Boss, no sales today. Buy stock people actually need or upgrade your shop.',
    };
  }
  if (outcome.qualityLoss > 0 && outcome.qualityLoss > Math.max(10000, outcome.revenue * 0.12)) {
    return {
      sw: 'Quality imekugharimu leo. Nunua mzigo wa risk ndogo au ajiri meneja wa mzigo.',
      en: 'Quality cost you today. Buy lower-risk stock or hire a stock manager.',
    };
  }
  if (netProfit > 100000) {
    const best = outcome.bestSellerId
      ? findProduct(outcome.bestSellerId)?.name ?? 'mzigo wako'
      : 'mzigo wako';
    return {
      sw: `Leo umeuza vizuri! ${best} imeenda sana. Endelea kuzungusha mzigo.`,
      en: `Great day! Your top mover did well. Keep flipping that stock.`,
    };
  }
  if (netProfit < 0) {
    return {
      sw: 'Hasara leo. Punguza matumizi au badilisha mzigo unaouzwa polepole.',
      en: 'A loss today. Cut expenses or swap out slow-moving stock.',
    };
  }
  return {
    sw: 'Faida ya wastani. Endelea kuzungusha pesa, biashara ni stamina.',
    en: 'Modest profit. Keep flipping cash — business is a marathon.',
  };
}
