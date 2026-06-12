import { ProductCategory } from '@/types';

// Rotating weekly seasons. Each 7-day block has a theme that boosts
// demand for certain product categories. Deterministic from the day.

export interface Season {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  descriptionEn: string;
  boostedCategories: ProductCategory[];
  boostPercent: number;
}

export const SEASONS: Season[] = [
  {
    id: 'joto',
    name: 'Joto Kali',
    nameEn: 'Heat Wave',
    emoji: '☀️',
    description: 'Jua kali la Dar. Vinywaji, vitafunwa na miwani vinakwenda kasi.',
    descriptionEn: 'Dar heat is on. Drinks, snacks and sunglasses fly off the table.',
    boostedCategories: ['food', 'cosmetics'],
    boostPercent: 0.25,
  },
  {
    id: 'shule',
    name: 'Msimu wa Shule',
    nameEn: 'Back to School',
    emoji: '🎒',
    description: 'Shule zinafunguliwa. Mikoba, soksi na vifaa vya shule vinatafutwa.',
    descriptionEn: 'Schools are opening. Backpacks, socks and school supplies in demand.',
    boostedCategories: ['school', 'clothes', 'shoes'],
    boostPercent: 0.25,
  },
  {
    id: 'mvua',
    name: 'Msimu wa Mvua',
    nameEn: 'Rainy Season',
    emoji: '🌧️',
    description: 'Mvua zinanyesha. Vifaa vya nyumbani na taa za solar vinauzika.',
    descriptionEn: 'The rains are here. Home goods and solar lamps sell well.',
    boostedCategories: ['home', 'imported'],
    boostPercent: 0.25,
  },
  {
    id: 'sikukuu',
    name: 'Msimu wa Sikukuu',
    nameEn: 'Festive Season',
    emoji: '🎉',
    description: 'Sherehe mtaani! Simu, elektroniki na manukato vinakwenda sana.',
    descriptionEn: 'Celebration time! Phones, electronics and perfumes are hot.',
    boostedCategories: ['phone_accessories', 'electronics', 'spare_parts'],
    boostPercent: 0.25,
  },
];

export function seasonForDay(day: number): Season {
  const week = Math.floor((Math.max(1, day) - 1) / 7);
  return SEASONS[week % SEASONS.length];
}

/** Demand boost for a category on a given day (0 when not boosted). */
export function seasonBoostFor(day: number, category: ProductCategory): number {
  const season = seasonForDay(day);
  return season.boostedCategories.includes(category) ? season.boostPercent : 0;
}

/** Days until the current season changes. */
export function daysLeftInSeason(day: number): number {
  return 7 - ((Math.max(1, day) - 1) % 7);
}
