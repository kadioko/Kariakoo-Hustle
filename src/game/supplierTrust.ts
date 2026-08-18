import { SupplierQualityTier } from '@/types';

export const MAX_SUPPLIER_TRUST = 100;
export const MAX_SUPPLIER_DISCOUNT = 0.06;

export interface SupplierTrustLevel {
  id: 'new' | 'known' | 'trusted' | 'inner_circle';
  name: string;
  nameEn: string;
}

const TRUST_LEVELS: { minimum: number; level: SupplierTrustLevel }[] = [
  { minimum: 75, level: { id: 'inner_circle', name: 'Mshirika wa karibu', nameEn: 'Inner circle' } },
  { minimum: 45, level: { id: 'trusted', name: 'Mfanyabiashara anayeaminika', nameEn: 'Trusted trader' } },
  { minimum: 15, level: { id: 'known', name: 'Unajulikana sokoni', nameEn: 'Known at the market' } },
  { minimum: 0, level: { id: 'new', name: 'Mgeni kwa supplier', nameEn: 'New to the supplier' } },
];

export function clampSupplierTrust(trust: number): number {
  return Math.max(0, Math.min(MAX_SUPPLIER_TRUST, Math.round(trust)));
}

/** A small loyalty discount: useful, but never enough to replace good buying decisions. */
export function supplierTrustDiscount(trust: number): number {
  return (clampSupplierTrust(trust) / MAX_SUPPLIER_TRUST) * MAX_SUPPLIER_DISCOUNT;
}

export function supplierTrustLevel(trust: number): SupplierTrustLevel {
  const normalized = clampSupplierTrust(trust);
  return TRUST_LEVELS.find((entry) => normalized >= entry.minimum)?.level ?? TRUST_LEVELS[3].level;
}

/**
 * Regular, quality-conscious orders build a supplier relationship. Hard haggling remains valid,
 * but asking for the deepest discount slows that relationship down.
 */
export function supplierTrustAfterPurchase(
  currentTrust: number,
  quantity: number,
  qualityTier: SupplierQualityTier,
  haggleDiscountPercent: number = 0,
): number {
  const orderGain = Math.min(3, Math.max(0, Math.ceil(quantity / 8)));
  const qualityBonus = qualityTier === 'premium' ? 1 : qualityTier === 'budget' ? -1 : 0;
  const hagglePenalty = haggleDiscountPercent >= 15 ? -2 : haggleDiscountPercent >= 10 ? -1 : 0;
  return clampSupplierTrust(currentTrust + orderGain + qualityBonus + hagglePenalty);
}
