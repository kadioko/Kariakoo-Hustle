export interface RewardedAdOption {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  fairnessNote: string;
  fairnessNoteEn: string;
  emoji: string;
}

export interface CosmeticTheme {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  colors: [string, string, string];
}

export const ADS_ENABLED = false;

export const REWARDED_AD_OPTIONS: RewardedAdOption[] = [
  {
    id: 'daily_bonus',
    title: 'Ongeza Bonus Ndogo ya Siku',
    titleEn: 'Double a Small Daily Bonus',
    description: 'Reward ndogo baada ya siku nzuri, si faida yote ya biashara.',
    descriptionEn: 'A small reward after a good day, not a full profit multiplier.',
    fairnessNote: 'Inalinda somo la cash flow: faida kuu inatoka kwenye biashara.',
    fairnessNoteEn: 'Protects the cash-flow lesson: main profit still comes from business choices.',
    emoji: '🎁',
  },
  {
    id: 'bad_event_recovery',
    title: 'Punguza Hasara ya Tukio Baya',
    titleEn: 'Recover Part of a Bad Event',
    description: 'Recover sehemu ndogo ya hasara bila kufuta risk yote.',
    descriptionEn: 'Recover a small part of a loss without deleting all risk.',
    fairnessNote: 'Haisafishi makosa yote; inasaidia tu mchezaji asivunjike moyo.',
    fairnessNoteEn: 'Does not erase every mistake; it only softens frustration.',
    emoji: '🛟',
  },
  {
    id: 'speed_selling',
    title: 'Harakisha Animation ya Kuuza',
    titleEn: 'Speed Up Selling Animation',
    description: 'Inapunguza muda wa presentation, si kuongeza faida.',
    descriptionEn: 'Reduces presentation time, not profit.',
    fairnessNote: 'Ni convenience tu, haivunji balance ya biashara.',
    fairnessNoteEn: 'Pure convenience, so it does not break business balance.',
    emoji: '⚡',
  },
  {
    id: 'supplier_tip',
    title: 'Tip Ndogo ya Supplier',
    titleEn: 'Small Supplier Tip',
    description: 'Dokezo kuhusu bidhaa moja yenye demand au risk leo.',
    descriptionEn: 'A hint about one product with notable demand or risk today.',
    fairnessNote: 'Inafundisha maamuzi bora badala ya kutoa pesa moja kwa moja.',
    fairnessNoteEn: 'Teaches better decisions instead of giving direct cash.',
    emoji: '💡',
  },
];

export const COSMETIC_THEMES: CosmeticTheme[] = [
  {
    id: 'kariakoo_classic',
    name: 'Kariakoo Classic',
    nameEn: 'Kariakoo Classic',
    description: 'Rangi za soko, meza, na vibe ya biashara ya mwanzo.',
    descriptionEn: 'Market colors, street table energy, and early hustle mood.',
    emoji: '🛒',
    colors: ['#0F8B4C', '#F6C445', '#E14D2A'],
  },
  {
    id: 'modern_duka',
    name: 'Modern Duka',
    nameEn: 'Modern Duka',
    description: 'Muonekano safi wa duka la kisasa lenye display nzuri.',
    descriptionEn: 'A clean modern shop look with sharper display energy.',
    emoji: '🏪',
    colors: ['#155E75', '#22D3EE', '#F8FAFC'],
  },
  {
    id: 'wholesale_boss',
    name: 'Wholesale Boss',
    nameEn: 'Wholesale Boss',
    description: 'Theme ya godown, bulk orders, na biashara kubwa.',
    descriptionEn: 'Warehouse, bulk-order, and big-business theme.',
    emoji: '🏭',
    colors: ['#1F2937', '#F59E0B', '#10B981'],
  },
  {
    id: 'zanzibar_branch',
    name: 'Zanzibar Branch',
    nameEn: 'Zanzibar Branch',
    description: 'Rangi za bahari, branch ya kisiwani, na biashara ya watalii.',
    descriptionEn: 'Ocean colors, island branch mood, and tourist trade.',
    emoji: '🌊',
    colors: ['#0369A1', '#2DD4BF', '#FDE68A'],
  },
];
