import { GameState, InventoryItem, Product, Risk } from '@/types';
import { findProduct } from '@/data/products';
import { findLocation } from '@/data/locations';
import { UPGRADES } from '@/data/upgrades';
import { WORKERS } from '@/data/workers';
import { ownsRentFreeFor, propertyCapacityBonus, totalPropertyValue } from './property';

export const STARTING_CASH = 50000;
export const BASE_INVENTORY_CAPACITY = 30;

export function inventoryUnits(state: GameState): number {
  return state.inventory.reduce((sum, i) => sum + i.quantity, 0);
}

export function inventoryValue(state: GameState): number {
  return state.inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
}

export function inventorySellValue(state: GameState): number {
  return state.inventory.reduce((sum, i) => {
    const p = findProduct(i.productId);
    if (!p) return sum;
    return sum + i.quantity * p.sellPrice;
  }, 0);
}

export function inventoryCapacity(state: GameState): number {
  let cap = BASE_INVENTORY_CAPACITY;
  const loc = findLocation(state.currentLocationId);
  if (loc) cap += loc.capacityBonus;
  state.upgrades.forEach((id) => {
    const u = UPGRADES.find((x) => x.id === id);
    if (u?.effects.inventoryCapacityBonus) cap += u.effects.inventoryCapacityBonus;
  });
  cap += propertyCapacityBonus(state);
  return cap;
}

export function totalUpgradeValue(state: GameState): number {
  return state.upgrades.reduce((sum, id) => {
    const u = UPGRADES.find((x) => x.id === id);
    return sum + (u?.cost ?? 0);
  }, 0);
}

export function totalLocationValue(state: GameState): number {
  return state.locations.reduce((sum, id) => {
    const l = findLocation(id);
    return sum + (l?.unlockCost ?? 0);
  }, 0);
}

export function totalLoanBalance(state: GameState): number {
  return state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
}

export function netWorth(state: GameState): number {
  return Math.max(0,
    state.cash +
    inventoryValue(state) +
    totalUpgradeValue(state) +
    totalLocationValue(state) +
    totalPropertyValue(state) -
    totalLoanBalance(state),
  );
}

export interface DailyExpenses {
  rent: number;
  transport: number;
  workerSalary: number;
  storage: number;
  loanPayment: number;
  total: number;
}

export function calcDailyExpenses(state: GameState): DailyExpenses {
  const loc = findLocation(state.currentLocationId);
  // Owning your spot means no rent
  let rent = ownsRentFreeFor(state, state.currentLocationId) ? 0 : loc?.dailyRent ?? 0;
  // Transport scales gently: 1,500 base + 300 per level (not 500)
  let transport = 1500 + state.level * 300;
  let workerSalary = state.workers.reduce((sum, id) => {
    const w = WORKERS.find((x) => x.id === id);
    return sum + (w?.salary ?? 0);
  }, 0);
  let storage = state.upgrades.includes('storage_room') ? 2000 : 0;
  const loanPayment = state.loans.reduce(
    (sum, loan) => sum + Math.min(loan.dailyPayment, loan.remainingBalance),
    0,
  );

  let reduction = 0;
  state.upgrades.forEach((id) => {
    const u = UPGRADES.find((x) => x.id === id);
    if (u?.effects.expenseReductionPercent) reduction += u.effects.expenseReductionPercent;
  });
  state.workers.forEach((id) => {
    const w = WORKERS.find((x) => x.id === id);
    if (w?.effects.expenseReductionPercent) reduction += w.effects.expenseReductionPercent;
  });
  reduction = Math.min(reduction, 0.5);

  rent = Math.round(rent * (1 - reduction));
  transport = Math.round(transport * (1 - reduction));
  workerSalary = Math.round(workerSalary * (1 - reduction));
  storage = Math.round(storage * (1 - reduction));

  const total = rent + transport + workerSalary + storage + loanPayment;
  return { rent, transport, workerSalary, storage, loanPayment, total };
}

export function settleDailyLoans(state: GameState): GameState {
  if (state.loans.length === 0) return state;

  const loans = state.loans
    .map((loan) => {
      const payment = Math.min(loan.dailyPayment, loan.remainingBalance);
      return {
        ...loan,
        remainingBalance: Math.max(0, loan.remainingBalance - payment),
        daysRemaining: Math.max(0, loan.daysRemaining - 1),
      };
    })
    .filter((loan) => loan.remainingBalance > 0);

  return { ...state, loans };
}

/** Bulk buying discount: 20+ units → 5%, 50+ units → 10%. */
export function bulkDiscountRate(qty: number): number {
  if (qty >= 50) return 0.1;
  if (qty >= 20) return 0.05;
  return 0;
}

const CLEARANCE_RATE: Record<Risk, number> = {
  low: 0.78,
  medium: 0.68,
  high: 0.58,
};

export function clearanceUnitPrice(
  product: Product,
  unitCost: number,
  sellPrice: number = product.sellPrice,
): number {
  const discountedSellPrice = Math.round(sellPrice * CLEARANCE_RATE[product.risk]);
  const floorPrice = Math.round(unitCost * 0.5);
  return Math.max(floorPrice, discountedSellPrice);
}

export function removeInventoryUnits(
  inventory: InventoryItem[],
  productId: string,
  qty: number,
): InventoryItem[] {
  return inventory
    .map((item) => {
      if (item.productId !== productId) return item;
      return { ...item, quantity: Math.max(0, item.quantity - qty) };
    })
    .filter((item) => item.quantity > 0);
}

export function addInventory(
  inventory: InventoryItem[],
  productId: string,
  qty: number,
  unitCost: number,
  acquiredDay?: number,
  qualityReturnMultiplier: number = 1,
): InventoryItem[] {
  const next = [...inventory];
  const idx = next.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    const existing = next[idx];
    const totalQty = existing.quantity + qty;
    const blended =
      (existing.quantity * existing.unitCost + qty * unitCost) / totalQty;
    const blendedQuality =
      (existing.quantity * (existing.qualityReturnMultiplier ?? 1) + qty * qualityReturnMultiplier) / totalQty;
    const mergedAcquiredDay = acquiredDay && existing.acquiredDay
      ? Math.round((existing.quantity * existing.acquiredDay + qty * acquiredDay) / totalQty)
      : acquiredDay ?? existing.acquiredDay;
    next[idx] = {
      productId,
      quantity: totalQty,
      unitCost: Math.round(blended),
      ...(mergedAcquiredDay ? { acquiredDay: mergedAcquiredDay } : {}),
      ...(Math.abs(blendedQuality - 1) > 0.01 ? { qualityReturnMultiplier: blendedQuality } : {}),
    };
  } else {
    next.push({
      productId,
      quantity: qty,
      unitCost,
      ...(acquiredDay ? { acquiredDay } : {}),
      ...(Math.abs(qualityReturnMultiplier - 1) > 0.01 ? { qualityReturnMultiplier } : {}),
    });
  }
  return next;
}
