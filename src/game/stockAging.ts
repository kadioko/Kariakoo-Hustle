import { InventoryItem } from '@/types';

const GRACE_DAYS = 3;
const MAX_DRAG = 0.3;

export function stockAgeDays(item: InventoryItem, currentDay: number): number {
  if (!item.acquiredDay || item.acquiredDay < 1) return 0;
  return Math.max(0, currentDay - item.acquiredDay);
}

/** Stock stays healthy for three days, then loses up to 30% of its sell rate. */
export function stockAgeSellRateImpact(item: InventoryItem, currentDay: number): number {
  const overdueDays = Math.max(0, stockAgeDays(item, currentDay) - GRACE_DAYS);
  return 1 - Math.min(MAX_DRAG, overdueDays * 0.05);
}

export function stockAgeTone(age: number): 'fresh' | 'aging' | 'old' {
  if (age <= GRACE_DAYS) return 'fresh';
  if (age <= 6) return 'aging';
  return 'old';
}
