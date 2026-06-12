import { GameState } from '@/types';

// Property ladder: stop renting → own your spot → own buildings → collect rent.

export interface Property {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  cost: number;
  unlockLevel: number;
  /** Owning this removes rent at the linked location */
  rentFreeLocationId?: string;
  /** Extra inventory capacity */
  capacityBonus?: number;
  /** Passive landlord income per day */
  dailyIncome?: number;
  description: string;
  descriptionEn: string;
}

export const PROPERTIES: Property[] = [
  {
    id: 'stall_kariakoo',
    name: 'Kiti chako Kariakoo',
    nameEn: 'Your Kariakoo Spot',
    emoji: '🪑',
    cost: 180000,
    unlockLevel: 3,
    rentFreeLocationId: 'kariakoo_table',
    description: 'Nunua nafasi yako ya mezani. Hakuna kodi tena Kariakoo.',
    descriptionEn: 'Buy your table spot outright. No more daily rent at Kariakoo.',
  },
  {
    id: 'godown_ilala',
    name: 'Godown ya Ilala',
    nameEn: 'Ilala Warehouse',
    emoji: '🏗️',
    cost: 800000,
    unlockLevel: 7,
    capacityBonus: 25,
    description: 'Ghala lako mwenyewe. Mzigo mkubwa zaidi, bila kodi ya storage.',
    descriptionEn: 'Your own warehouse. Hold far more stock.',
  },
  {
    id: 'duka_uswahilini',
    name: 'Duka la Uswahilini',
    nameEn: 'Uswahilini Shop',
    emoji: '🏬',
    cost: 1200000,
    unlockLevel: 8,
    dailyIncome: 12000,
    description: 'Duka la kupangisha. Mpangaji analipa kila siku.',
    descriptionEn: 'A shop you rent out. The tenant pays you daily.',
  },
  {
    id: 'building_kariakoo',
    name: 'Jengo la Kariakoo',
    nameEn: 'Kariakoo Building',
    emoji: '🏢',
    cost: 2500000,
    unlockLevel: 9,
    dailyIncome: 28000,
    description: 'Jengo zima la maduka. Sasa wewe ndiye landlord.',
    descriptionEn: 'A whole building of shops. Now YOU are the landlord.',
  },
];

export function findProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

export function ownsRentFreeFor(state: GameState, locationId: string): boolean {
  return state.ownedProperties.some(
    (id) => findProperty(id)?.rentFreeLocationId === locationId,
  );
}

export function propertyCapacityBonus(state: GameState): number {
  return state.ownedProperties.reduce(
    (sum, id) => sum + (findProperty(id)?.capacityBonus ?? 0),
    0,
  );
}

export function propertyDailyIncome(state: GameState): number {
  return state.ownedProperties.reduce(
    (sum, id) => sum + (findProperty(id)?.dailyIncome ?? 0),
    0,
  );
}

export function totalPropertyValue(state: GameState): number {
  return state.ownedProperties.reduce(
    (sum, id) => sum + (findProperty(id)?.cost ?? 0),
    0,
  );
}

export type PropertyActionResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'already_owned' | 'not_unlocked' | 'not_enough_cash' };

export function buyPropertyAction(
  state: GameState,
  id: string,
): { state: GameState; result: PropertyActionResult } {
  const prop = findProperty(id);
  if (!prop) return { state, result: { ok: false, reason: 'not_found' } };
  if (state.ownedProperties.includes(id)) {
    return { state, result: { ok: false, reason: 'already_owned' } };
  }
  if (state.level < prop.unlockLevel) {
    return { state, result: { ok: false, reason: 'not_unlocked' } };
  }
  if (state.cash < prop.cost) {
    return { state, result: { ok: false, reason: 'not_enough_cash' } };
  }
  return {
    state: {
      ...state,
      cash: state.cash - prop.cost,
      ownedProperties: [...state.ownedProperties, id],
    },
    result: { ok: true },
  };
}
