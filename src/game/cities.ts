import { GameState, ProductCategory } from '@/types';

// Trade routes: each city has cheaper goods in its specialty categories
// and its own demand level. Travel costs cash, takes a day, and risks stock.

export interface City {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  unlockLevel: number;
  travelCost: number;
  /** Chance of losing some stock on the road */
  travelRisk: number;
  /** Buy price multipliers per category (<1 = cheaper here) */
  buyFactors: Partial<Record<ProductCategory, number>>;
  /** Overall demand multiplier while trading here */
  demandFactor: number;
  description: string;
  descriptionEn: string;
  flavor: string;
  flavorEn: string;
}

export const CITIES: City[] = [
  {
    id: 'dar',
    name: 'Dar es Salaam',
    nameEn: 'Dar es Salaam',
    emoji: '🏙️',
    unlockLevel: 1,
    travelCost: 0,
    travelRisk: 0,
    buyFactors: { phone_accessories: 0.95, electronics: 0.95 },
    demandFactor: 1,
    description: 'Nyumbani. Kariakoo — moyo wa biashara ya Tanzania.',
    descriptionEn: 'Home turf. Kariakoo — the heart of Tanzanian trade.',
    flavor: 'Kila kitu kinapatikana, kila mtu anauza.',
    flavorEn: 'Everything is available, everyone is selling.',
  },
  {
    id: 'arusha',
    name: 'Arusha',
    nameEn: 'Arusha',
    emoji: '🏔️',
    unlockLevel: 4,
    travelCost: 30000,
    travelRisk: 0.06,
    buyFactors: { food: 0.8, clothes: 0.88 },
    demandFactor: 0.95,
    description: 'Mji wa watalii na kilimo. Chakula na nguo ni bei poa.',
    descriptionEn: 'Tourism and farming town. Food and clothes are cheap here.',
    flavor: 'Hewa safi ya Kilimanjaro, biashara ya utulivu.',
    flavorEn: 'Fresh Kilimanjaro air, calmer business pace.',
  },
  {
    id: 'mwanza',
    name: 'Mwanza',
    nameEn: 'Mwanza',
    emoji: '🪨',
    unlockLevel: 6,
    travelCost: 50000,
    travelRisk: 0.08,
    buyFactors: { spare_parts: 0.8, home: 0.85 },
    demandFactor: 1.05,
    description: 'Mji wa Mwamba kando ya Ziwa Victoria. Spea na vifaa vya nyumbani ni rahisi.',
    descriptionEn: 'Rock City on Lake Victoria. Spare parts and home goods come cheap.',
    flavor: 'Bandari ya ziwa, mzunguko wa kasi.',
    flavorEn: 'Lake port energy, fast turnover.',
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar',
    nameEn: 'Zanzibar',
    emoji: '🏝️',
    unlockLevel: 8,
    travelCost: 80000,
    travelRisk: 0.1,
    buyFactors: { imported: 0.78, cosmetics: 0.85 },
    demandFactor: 1.15,
    description: 'Kisiwa cha biashara ya kale. Bidhaa za nje na vipodozi bei nafuu, watalii wananunua kwa bei juu.',
    descriptionEn: 'Ancient trading island. Imports and cosmetics are cheap, tourists pay premium prices.',
    flavor: 'Ferry, forodha, na faida — kama unajua njia.',
    flavorEn: 'Ferries, customs, and profit — if you know the way.',
  },
];

export function findCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function cityBuyFactor(cityId: string, category: ProductCategory): number {
  return findCity(cityId)?.buyFactors[category] ?? 1;
}

export function cityDemandFactor(cityId: string): number {
  return findCity(cityId)?.demandFactor ?? 1;
}

export type TravelResult =
  | { ok: true; state: GameState; lostUnits: number }
  | { ok: false; reason: 'not_found' | 'already_here' | 'not_unlocked' | 'not_enough_cash' };

/**
 * Travel to another city: costs cash, takes the rest of the day (day advances),
 * and risks losing a slice of inventory on the road.
 */
export function travelToCity(
  state: GameState,
  cityId: string,
  rand: () => number = Math.random,
): TravelResult {
  const city = findCity(cityId);
  if (!city) return { ok: false, reason: 'not_found' };
  if (state.currentCityId === cityId) return { ok: false, reason: 'already_here' };
  if (state.level < city.unlockLevel) return { ok: false, reason: 'not_unlocked' };
  if (state.cash < city.travelCost) return { ok: false, reason: 'not_enough_cash' };

  let lostUnits = 0;
  let inventory = state.inventory;
  if (city.travelRisk > 0 && rand() < city.travelRisk && inventory.length > 0) {
    const lossPct = 0.05 + rand() * 0.05; // lose 5-10%
    inventory = inventory
      .map((item) => {
        const lost = Math.floor(item.quantity * lossPct);
        lostUnits += lost;
        return { ...item, quantity: item.quantity - lost };
      })
      .filter((item) => item.quantity > 0);
  }

  return {
    ok: true,
    lostUnits,
    state: {
      ...state,
      cash: state.cash - city.travelCost,
      currentCityId: cityId,
      day: state.day + 1, // travel takes the rest of the day
      inventory,
    },
  };
}
