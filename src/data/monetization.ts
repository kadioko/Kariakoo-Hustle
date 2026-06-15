export interface RewardedAdOption {
  id: RewardedAdType;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  fairnessNote: string;
  fairnessNoteEn: string;
  emoji: string;
}

export interface InterstitialPolicy {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
}

export interface PremiumRoadmapOption {
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

export type RewardedAdType =
  | 'double_daily_profit'
  | 'market_insider_tip'
  | 'speed_delivery'
  | 'bad_trade_recovery';

export const ADS_ENABLED = false;
export const INTERSTITIALS_ENABLED = false;
export const PREMIUM_ENABLED = false;

export const ADMOB_ANDROID_APP_ID = 'ca-app-pub-1484098434630929~6907155869';
export const ADMOB_REWARDED_AD_UNIT_ID = 'ca-app-pub-1484098434630929/6500837461';
export const ADMOB_INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-1484098434630929/3874674129';

export const REWARDED_AD_OPTIONS: RewardedAdOption[] = [
  {
    id: 'double_daily_profit',
    title: 'Double Daily Profit',
    titleEn: 'Double Daily Profit',
    description: 'Baada ya ripoti ya siku, ad inaweza kuongeza bonus ya faida ya siku hiyo.',
    descriptionEn: 'After the daily report, an ad can double the eligible daily profit bonus.',
    fairnessNote: 'Iwekwe na cap ndogo ili biashara, stock choices, na cash flow zibaki ndio chanzo kikuu cha ukuaji.',
    fairnessNoteEn: 'Use a small cap so business choices, stock picks, and cash flow remain the real source of growth.',
    emoji: '💰',
  },
  {
    id: 'market_insider_tip',
    title: 'Market Insider Tip',
    titleEn: 'Market Insider Tip',
    description: 'Dokezo la sokoni kuhusu bidhaa yenye demand, risk, au margin nzuri leo.',
    descriptionEn: 'A market hint about one product with strong demand, risk, or margin today.',
    fairnessNote: 'Inatoa taarifa, sio pesa. Mchezaji bado anaamua na kubeba risk.',
    fairnessNoteEn: 'Gives information, not cash. The player still decides and carries the risk.',
    emoji: '🧠',
  },
  {
    id: 'speed_delivery',
    title: 'Speed Up Delivery',
    titleEn: 'Speed Up Delivery',
    description: 'Harakisha delivery au selling presentation bila kubadilisha faida ya bidhaa.',
    descriptionEn: 'Speed up delivery or selling presentation without changing product profit.',
    fairnessNote: 'Ni convenience reward. Haipaswi kuongeza demand au margin moja kwa moja.',
    fairnessNoteEn: 'This is a convenience reward. It should not directly increase demand or margin.',
    emoji: '⚡',
  },
  {
    id: 'bad_trade_recovery',
    title: 'Recover From Bad Trade',
    titleEn: 'Recover From Bad Trade',
    description: 'Punguza sehemu ya hasara baada ya trade mbaya, bidhaa mbovu, au tukio baya.',
    descriptionEn: 'Recover part of a loss after a bad trade, faulty stock, or negative event.',
    fairnessNote: 'Recover sehemu tu. Hasara ibaki fundisho, sio ad kuifuta kabisa.',
    fairnessNoteEn: 'Recover only a portion. A loss should remain a lesson, not be erased by an ad.',
    emoji: '🛟',
  },
];

export const INTERSTITIAL_POLICY: InterstitialPolicy[] = [
  {
    id: 'rare_interstitials',
    title: 'Interstitials Chache Sana',
    titleEn: 'Very Few Interstitials',
    description: 'Zisitokee katikati ya maamuzi muhimu kama kununua stock, kuajiri, au kufungua location.',
    descriptionEn: 'Never interrupt important decisions like buying stock, hiring, or opening a location.',
    emoji: '🧘',
  },
  {
    id: 'safe_moments_only',
    title: 'Tumia Safe Moments Tu',
    titleEn: 'Safe Moments Only',
    description: 'Kama zikiwahi kuwashwa, ziwe baada ya report au wakati wa kurudi menu.',
    descriptionEn: 'If enabled later, show them only after reports or when returning to menu.',
    emoji: '🕒',
  },
];

export const PREMIUM_ROADMAP: PremiumRoadmapOption[] = [
  {
    id: 'premium_no_ads',
    title: 'Premium No-Ads',
    titleEn: 'Premium No-Ads',
    description: 'Inaweza kuongezwa baada ya ads halisi kuwepo. Kwa sasa hakuna kitu cha kununua.',
    descriptionEn: 'Can be added after real ads exist. For now, there is nothing to buy.',
    fairnessNote: 'No-ads iwe comfort purchase tu, sio boost ya faida.',
    fairnessNoteEn: 'No-ads should be a comfort purchase only, not a profit boost.',
    emoji: '👑',
  },
  {
    id: 'paid_expansion_packs',
    title: 'Expansion Packs',
    titleEn: 'Expansion Packs',
    description: 'Baadaye inaweza kuongeza miji, bidhaa, story events, na cosmetic themes.',
    descriptionEn: 'Later it can add cities, products, story events, and cosmetic themes.',
    fairnessNote: 'Expansion packs ziongeze content, sio short-cut ya ku-win.',
    fairnessNoteEn: 'Expansion packs should add content, not a shortcut to win.',
    emoji: '🗺️',
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
