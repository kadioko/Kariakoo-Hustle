import { SupplierQualityTier } from '@/types';

export interface SupplierQuality {
  id: SupplierQualityTier;
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  costMultiplier: number;
  returnMultiplier: number;
}

/** Budget stock saves cash but creates a real quality tradeoff. */
export const SUPPLIER_QUALITIES: SupplierQuality[] = [
  {
    id: 'budget',
    name: 'Bei Nafuu',
    nameEn: 'Budget',
    detail: 'Bei chini, returns zinaweza kuongezeka.',
    detailEn: 'Lower cost, but returns can rise.',
    costMultiplier: 0.86,
    returnMultiplier: 1.65,
  },
  {
    id: 'standard',
    name: 'Kawaida',
    nameEn: 'Standard',
    detail: 'Mchanganyiko wa bei na quality.',
    detailEn: 'Balanced price and quality.',
    costMultiplier: 1,
    returnMultiplier: 1,
  },
  {
    id: 'premium',
    name: 'Quality Juu',
    nameEn: 'Premium',
    detail: 'Bei juu kidogo, returns chache.',
    detailEn: 'Costs more, with fewer returns.',
    costMultiplier: 1.18,
    returnMultiplier: 0.45,
  },
];

export function supplierQualityFor(tier: SupplierQualityTier = 'standard'): SupplierQuality {
  return SUPPLIER_QUALITIES.find((quality) => quality.id === tier) ?? SUPPLIER_QUALITIES[1];
}

export function supplierUnitPrice(basePrice: number, tier: SupplierQualityTier = 'standard'): number {
  return Math.max(1, Math.round(basePrice * supplierQualityFor(tier).costMultiplier));
}

export function supplierTierForReturnMultiplier(multiplier: number | undefined): SupplierQualityTier {
  if ((multiplier ?? 1) <= 0.7) return 'premium';
  if ((multiplier ?? 1) >= 1.3) return 'budget';
  return 'standard';
}
