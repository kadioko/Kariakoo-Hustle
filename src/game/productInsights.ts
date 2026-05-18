import { Demand, Language, Product, Risk } from '@/types';

const DEMAND_SCORE: Record<Demand, number> = {
  low: 1,
  medium: 2,
  high: 3,
  very_high: 4,
};

const RISK_PENALTY: Record<Risk, number> = {
  low: 0,
  medium: 12,
  high: 24,
};

export interface ProductInsight {
  score: number;
  label: string;
  description: string;
  tone: 'great' | 'good' | 'careful' | 'risky';
  margin: number;
  marginPercent: number;
}

export function productMargin(product: Product): { margin: number; marginPercent: number } {
  const margin = product.sellPrice - product.buyPrice;
  return {
    margin,
    marginPercent: Math.round((margin / product.buyPrice) * 100),
  };
}

export function getProductInsight(product: Product, language: Language): ProductInsight {
  const { margin, marginPercent } = productMargin(product);
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(DEMAND_SCORE[product.demand] * 20 + marginPercent * 0.45 - RISK_PENALTY[product.risk]),
    ),
  );

  if (score >= 78) {
    return {
      score,
      margin,
      marginPercent,
      tone: 'great',
      label: language === 'sw' ? 'Moto Leo' : 'Hot Today',
      description:
        language === 'sw'
          ? 'Demand iko juu na faida inaeleweka. Huu ni mzigo mzuri wa kuzungusha mapema.'
          : 'Strong demand with sensible margin. A good stock turner for early growth.',
    };
  }

  if (score >= 58) {
    return {
      score,
      margin,
      marginPercent,
      tone: 'good',
      label: language === 'sw' ? 'Mzigo Mzuri' : 'Solid Pick',
      description:
        language === 'sw'
          ? 'Inaweza kuleta faida nzuri, hasa ukiinunua kwa kiasi kinacholingana na cash flow.'
          : 'Can produce good profit, especially when bought in a cash-flow-friendly quantity.',
    };
  }

  if (score >= 38) {
    return {
      score,
      margin,
      marginPercent,
      tone: 'careful',
      label: language === 'sw' ? 'Slow Moving' : 'Slow Moving',
      description:
        language === 'sw'
          ? 'Faida ipo, lakini usijaze stock yote hapa. Jaribu kidogo kwanza.'
          : 'There is profit here, but do not fill all capacity with it. Test a smaller batch.',
    };
  }

  return {
    score,
    margin,
    marginPercent,
    tone: 'risky',
    label: language === 'sw' ? 'Risky Stock' : 'Risky Stock',
    description:
      language === 'sw'
        ? 'Hii inaweza kukaa muda mrefu au kula cash. Inafaa zaidi ukiwa na akiba.'
        : 'This can sit in stock or tie up cash. Better when you have a stronger cushion.',
  };
}
