import { Language } from '@/types';

type Dict = Record<string, { sw: string; en: string }>;

export const STRINGS: Dict = {
  app_title: { sw: 'Kariakoo Hustle', en: 'Kariakoo Hustle' },
  app_subtitle: { sw: 'Biashara Empire', en: 'Biashara Empire' },
  tagline: {
    sw: 'Anza na meza moja, jenga empire yako.',
    en: 'Start with one table, build your empire.',
  },

  // Menu / nav
  menu_play: { sw: 'Anza Biashara', en: 'Start Business' },
  menu_continue: { sw: 'Endelea', en: 'Continue' },
  menu_new: { sw: 'Anza Upya', en: 'New Game' },
  menu_settings: { sw: 'Mipangilio', en: 'Settings' },
  menu_about: { sw: 'Kuhusu', en: 'About' },

  // Tabs
  tab_dashboard: { sw: 'Dashibodi', en: 'Dashboard' },
  tab_market: { sw: 'Soko', en: 'Market' },
  tab_inventory: { sw: 'Mzigo', en: 'Stock' },
  tab_upgrades: { sw: 'Boresha', en: 'Upgrades' },
  tab_more: { sw: 'Zaidi', en: 'More' },

  // Dashboard
  business_name: { sw: 'Jina la Biashara', en: 'Business' },
  cash: { sw: 'Pesa Taslimu', en: 'Cash' },
  inventory_value: { sw: 'Thamani ya Mzigo', en: 'Inventory Value' },
  daily_profit: { sw: 'Faida ya Jana', en: 'Yesterday’s Profit' },
  level: { sw: 'Level', en: 'Level' },
  reputation: { sw: 'Sifa', en: 'Reputation' },
  location: { sw: 'Eneo', en: 'Location' },
  rent_due: { sw: 'Kodi ya Leo', en: 'Today’s Rent' },
  workers: { sw: 'Wafanyakazi', en: 'Workers' },
  day: { sw: 'Siku', en: 'Day' },
  net_worth: { sw: 'Thamani Jumla', en: 'Net Worth' },

  buy_stock: { sw: 'Nunua Mzigo', en: 'Buy Stock' },
  inventory: { sw: 'Mzigo', en: 'Inventory' },
  upgrades: { sw: 'Maboresho', en: 'Upgrades' },
  hire_workers: { sw: 'Ajiri Wafanyakazi', en: 'Hire Workers' },
  locations: { sw: 'Maeneo', en: 'Locations' },
  reports: { sw: 'Ripoti', en: 'Reports' },
  achievements: { sw: 'Mafanikio', en: 'Achievements' },
  end_day: { sw: 'Maliza Siku', en: 'End Day' },
  sell_today: { sw: 'Uza Leo', en: 'Sell Today' },

  // Market
  category_all: { sw: 'Zote', en: 'All' },
  in_stock: { sw: 'Una stock', en: 'In stock' },
  buy_one: { sw: 'Nunua 1', en: 'Buy 1' },
  buy_five: { sw: 'Nunua 5', en: 'Buy 5' },
  buy_ten: { sw: 'Nunua 10', en: 'Buy 10' },
  not_unlocked: { sw: 'Bado haijafunguliwa', en: 'Locked' },
  not_enough_cash: { sw: 'Pesa haitoshi', en: 'Not enough cash' },
  capacity_full: { sw: 'Capacity imeisha', en: 'Capacity full' },
  buy: { sw: 'Nunua', en: 'Buy' },
  margin: { sw: 'Faida', en: 'Margin' },
  demand: { sw: 'Demand', en: 'Demand' },
  risk: { sw: 'Hatari', en: 'Risk' },
  capacity: { sw: 'Capacity', en: 'Capacity' },

  // Inventory
  no_stock: { sw: 'Bado huna mzigo. Nenda sokoni.', en: 'No stock yet. Visit the market.' },
  qty: { sw: 'Idadi', en: 'Qty' },
  unit_cost: { sw: 'Bei ya kununua', en: 'Unit cost' },
  total_value: { sw: 'Thamani', en: 'Value' },

  // Sell / report
  sell_title: { sw: 'Uza Leo', en: 'Sell Today' },
  sell_intro: {
    sw: 'Maliza siku ya biashara. Mzigo utauzwa kulingana na demand, level yako na maboresho yako.',
    en: 'End the business day. Stock will sell based on demand, your level and your upgrades.',
  },
  start_selling: { sw: 'Anza Kuuza', en: 'Start Selling' },
  daily_report: { sw: 'Ripoti ya Siku', en: 'Daily Report' },
  revenue: { sw: 'Mauzo', en: 'Revenue' },
  cogs: { sw: 'Gharama ya Mzigo', en: 'Cost of Goods' },
  gross_profit: { sw: 'Faida Ghafi', en: 'Gross Profit' },
  expenses: { sw: 'Matumizi', en: 'Expenses' },
  net_profit: { sw: 'Faida Halisi', en: 'Net Profit' },
  units_sold: { sw: 'Vipande Vilivyouzwa', en: 'Units Sold' },
  units_remaining: { sw: 'Mzigo Uliobaki', en: 'Stock Remaining' },
  best_seller: { sw: 'Imeenda Sana', en: 'Best Seller' },
  worst_seller: { sw: 'Haijaenda', en: 'Slow Mover' },
  reputation_change: { sw: 'Mabadiliko ya Sifa', en: 'Reputation Change' },
  rep_event: { sw: 'Tukio', en: 'Event' },
  advice: { sw: 'Ushauri', en: 'Advice' },
  continue: { sw: 'Endelea', en: 'Continue' },
  ok: { sw: 'Sawa', en: 'OK' },
  cancel: { sw: 'Ghairi', en: 'Cancel' },
  close: { sw: 'Funga', en: 'Close' },

  // Events
  event_title: { sw: 'Tukio la Mtaani', en: 'Street Event' },
  what_do_you_do: { sw: 'Utafanya nini?', en: 'What will you do?' },
  effect_applied: { sw: 'Athari ya tukio:', en: 'Event effect:' },

  // Upgrades / workers / locations
  cost: { sw: 'Bei', en: 'Cost' },
  salary: { sw: 'Mshahara', en: 'Salary' },
  benefit: { sw: 'Faida', en: 'Benefit' },
  unlock_level: { sw: 'Inahitaji level', en: 'Requires level' },
  owned: { sw: 'Umeshanunua', en: 'Owned' },
  hired: { sw: 'Umeshaajiri', en: 'Hired' },
  unlocked: { sw: 'Imefunguliwa', en: 'Unlocked' },
  unlock: { sw: 'Fungua', en: 'Unlock' },
  hire: { sw: 'Ajiri', en: 'Hire' },
  buy_upgrade: { sw: 'Nunua Boresho', en: 'Buy Upgrade' },
  switch_location: { sw: 'Nenda Hapa', en: 'Move Here' },
  current: { sw: 'Sasa hivi', en: 'Current' },
  daily_rent: { sw: 'Kodi ya Siku', en: 'Daily Rent' },
  demand_boost: { sw: 'Demand', en: 'Demand' },

  // Reports
  total_revenue: { sw: 'Mauzo Jumla', en: 'Total Revenue' },
  total_expenses: { sw: 'Matumizi Jumla', en: 'Total Expenses' },
  total_profit: { sw: 'Faida Jumla', en: 'Total Profit' },
  no_reports: { sw: 'Bado hujamaliza siku.', en: 'No days completed yet.' },

  // Achievements
  ach_locked: { sw: 'Bado', en: 'Locked' },
  ach_unlocked: { sw: 'Imepatikana', en: 'Unlocked' },

  // Settings
  language: { sw: 'Lugha', en: 'Language' },
  sound: { sw: 'Sauti', en: 'Sound' },
  vibration: { sw: 'Mtetemo', en: 'Vibration' },
  reset_progress: { sw: 'Anza Upya', en: 'Reset Progress' },
  reset_warning: {
    sw: 'Una uhakika? Hii itafuta progress yote.',
    en: 'Are you sure? This will erase all progress.',
  },
  about: { sw: 'Kuhusu Mchezo', en: 'About' },
  about_text: {
    sw: 'Kariakoo Hustle ni mchezo wa kufundisha biashara kwa furaha. Pesa zote ni za bandia.',
    en: 'Kariakoo Hustle is a fun business simulation. All money is fake.',
  },

  share_text: {
    sw: 'Nimeanza na 50,000 TZS kwenye Kariakoo Hustle na sasa biashara yangu ina thamani ya {nw}! Unaweza kunizidi?',
    en: 'I started with 50,000 TZS in Kariakoo Hustle and now my business is worth {nw}! Can you beat me?',
  },

  // Misc
  yes: { sw: 'Ndiyo', en: 'Yes' },
  no: { sw: 'Hapana', en: 'No' },
  back: { sw: 'Rudi', en: 'Back' },
  empty: { sw: 'Hakuna kitu hapa.', en: 'Nothing here yet.' },

  category_phone_accessories: { sw: 'Vifaa vya Simu', en: 'Phone Accessories' },
  category_clothes: { sw: 'Nguo', en: 'Clothes' },
  category_shoes: { sw: 'Viatu', en: 'Shoes' },
  category_cosmetics: { sw: 'Vipodozi', en: 'Cosmetics' },
  category_electronics: { sw: 'Elektroniki', en: 'Electronics' },
  category_food: { sw: 'Vyakula', en: 'Food' },
  category_spare_parts: { sw: 'Spea', en: 'Spare Parts' },
  category_school: { sw: 'Vifaa vya Shule', en: 'School Supplies' },
  category_home: { sw: 'Vifaa vya Nyumbani', en: 'Home Items' },
  category_imported: { sw: 'Bidhaa za Nje', en: 'Imported Goods' },

  demand_low: { sw: 'Chini', en: 'Low' },
  demand_medium: { sw: 'Wastani', en: 'Medium' },
  demand_high: { sw: 'Juu', en: 'High' },
  demand_very_high: { sw: 'Juu Sana', en: 'Very High' },

  risk_low: { sw: 'Chini', en: 'Low' },
  risk_medium: { sw: 'Wastani', en: 'Medium' },
  risk_high: { sw: 'Juu', en: 'High' },
};

export function t(key: string, lang: Language, vars?: Record<string, string>): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  let v = entry[lang] ?? entry.sw;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      v = v.replace(`{${k}}`, vars[k]);
    });
  }
  return v;
}

export function localize<T extends { [k: string]: any }>(
  obj: T,
  base: string,
  lang: Language,
): string {
  if (lang === 'en') {
    const enKey = `${base}En`;
    if (obj[enKey]) return obj[enKey] as string;
  }
  return obj[base] as string;
}
