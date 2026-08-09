/** Keeps a single purchase from consuming the cash needed for daily operations. */
export function safePurchaseQuantity(
  cash: number,
  quotedUnit: number,
  freeSlots: number,
  operatingReserve: number = 0,
): number {
  if (cash <= 0 || quotedUnit <= 0 || freeSlots <= 0) return 0;
  const spendableAfterReserve = Math.max(0, cash - Math.max(0, operatingReserve));
  const safeBudget = Math.min(cash * 0.25, spendableAfterReserve);
  if (safeBudget < quotedUnit) return 0;
  return Math.min(freeSlots, Math.max(1, Math.floor(safeBudget / quotedUnit)));
}

export type PurchaseSafety = 'safe' | 'tight' | 'unsafe';

export interface PurchaseCashPosition {
  cashAfterPurchase: number;
  operatingReserve: number;
  reserveShortfall: number;
  safety: PurchaseSafety;
}

export function purchaseCashPosition(
  cash: number,
  purchaseTotal: number,
  operatingReserve: number,
): PurchaseCashPosition {
  const reserve = Math.max(0, operatingReserve);
  const cashAfterPurchase = Math.max(0, cash - Math.max(0, purchaseTotal));
  const reserveShortfall = Math.max(0, reserve - cashAfterPurchase);
  const safety: PurchaseSafety = cashAfterPurchase >= reserve
    ? 'safe'
    : cashAfterPurchase >= reserve * 0.5
      ? 'tight'
      : 'unsafe';
  return { cashAfterPurchase, operatingReserve: reserve, reserveShortfall, safety };
}
