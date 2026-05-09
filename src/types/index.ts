export type Language = 'sw' | 'en';

export type Risk = 'low' | 'medium' | 'high';
export type Demand = 'low' | 'medium' | 'high' | 'very_high';

export type ProductCategory =
  | 'phone_accessories'
  | 'clothes'
  | 'shoes'
  | 'cosmetics'
  | 'electronics'
  | 'food'
  | 'spare_parts'
  | 'school'
  | 'home'
  | 'imported';

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: ProductCategory;
  buyPrice: number;
  sellPrice: number;
  demand: Demand;
  risk: Risk;
  unlockLevel: number;
  description: string;
  descriptionEn: string;
  emoji: string;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

export type EventEffect = {
  cash?: number;
  cashPercent?: number;
  reputation?: number;
  inventoryLossPercent?: number;
  demandMultiplier?: number;
  loan?: {
    principal: number;
    amountDue: number;
    termDays: number;
  };
};

export interface EventChoice {
  id: string;
  label: string;
  labelEn: string;
  effect: EventEffect;
  effectText: string;
  effectTextEn: string;
}

export type EventType = 'positive' | 'negative' | 'neutral' | 'choice';

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  probability: number;
  minLevel?: number;
  effect?: EventEffect;
  choices?: EventChoice[];
}

export interface Upgrade {
  id: string;
  name: string;
  nameEn: string;
  cost: number;
  unlockLevel: number;
  benefit: string;
  benefitEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  effects: {
    salesBoostPercent?: number;
    demandBoostPercent?: number;
    inventoryCapacityBonus?: number;
    expenseReductionPercent?: number;
    eventLossReductionPercent?: number;
    reputationBonus?: number;
  };
}

export type WorkerKind =
  | 'sales_assistant'
  | 'stock_manager'
  | 'delivery_rider'
  | 'social_promoter'
  | 'accountant'
  | 'security_guard'
  | 'branch_manager';

export interface Worker {
  id: WorkerKind;
  name: string;
  nameEn: string;
  salary: number;
  unlockLevel: number;
  benefit: string;
  benefitEn: string;
  emoji: string;
  effects: {
    salesBoostPercent?: number;
    demandBoostPercent?: number;
    inventoryLossReductionPercent?: number;
    eventLossReductionPercent?: number;
    expenseReductionPercent?: number;
  };
}

export interface Location {
  id: string;
  name: string;
  nameEn: string;
  unlockCost: number;
  dailyRent: number;
  demandMultiplier: number;
  capacityBonus: number;
  risk: Risk;
  description: string;
  descriptionEn: string;
  emoji: string;
}

export type AchievementCondition =
  | { type: 'cash_at_least'; value: number }
  | { type: 'net_worth_at_least'; value: number }
  | { type: 'first_sale' }
  | { type: 'workers_at_least'; value: number }
  | { type: 'locations_at_least'; value: number }
  | { type: 'upgrades_at_least'; value: number }
  | { type: 'level_at_least'; value: number };

export interface Achievement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  condition: AchievementCondition;
  reward?: { cash?: number; xp?: number; reputation?: number };
}

export interface DailyReport {
  day: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  expenseBreakdown?: {
    rent: number;
    transport: number;
    workerSalary: number;
    storage: number;
    loanPayment?: number;
  };
  netProfit: number;
  unitsSold: number;
  returnedUnits?: number;
  qualityLoss?: number;
  unitsRemaining: number;
  reputationChange: number;
  bestSellerId?: string;
  worstSellerId?: string;
  eventTitle?: string;
  eventTitleEn?: string;
  eventEffectText?: string;
  eventEffectTextEn?: string;
  advice: string;
  adviceEn: string;
}

export interface Settings {
  language: Language;
  sound: boolean;
  vibration: boolean;
}

export interface Loan {
  id: string;
  principal: number;
  remainingBalance: number;
  dailyPayment: number;
  daysRemaining: number;
  sourceTitle: string;
  sourceTitleEn: string;
}

export interface GameState {
  saveVersion: number;
  lastSavedAt?: string;
  businessName: string;
  cash: number;
  day: number;
  level: number;
  xp: number;
  reputation: number;
  inventory: InventoryItem[];
  upgrades: string[];
  workers: WorkerKind[];
  locations: string[];
  loans: Loan[];
  currentLocationId: string;
  achievements: string[];
  reports: DailyReport[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalQualityLoss: number;
  totalClearanceRevenue: number;
  totalClearanceLoss: number;
  productSalesCount: Record<string, number>;
  settings: Settings;
  hasMadeFirstSale: boolean;
  pendingEventId?: string;
}
