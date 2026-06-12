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
  personality: string;
  personalityEn: string;
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
  flavor: string;
  flavorEn: string;
  categoryBoosts?: Partial<Record<ProductCategory, number>>;
}

export type AchievementCondition =
  | { type: 'cash_at_least'; value: number }
  | { type: 'net_worth_at_least'; value: number }
  | { type: 'first_sale' }
  | { type: 'workers_at_least'; value: number }
  | { type: 'locations_at_least'; value: number }
  | { type: 'upgrades_at_least'; value: number }
  | { type: 'level_at_least'; value: number }
  | { type: 'streak_at_least'; value: number }
  | { type: 'day_at_least'; value: number };

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

export type MissionMetric = 'revenue' | 'units_sold' | 'net_profit' | 'no_quality_loss';

export interface Mission {
  id: string;
  day: number;
  metric: MissionMetric;
  title: string;
  titleEn: string;
  target: number;
  reward: { cash?: number; xp?: number; reputation?: number };
}

export interface MissionResult {
  id: string;
  title: string;
  titleEn: string;
  completed: boolean;
  progress: number;
  target: number;
  rewardText: string;
  rewardTextEn: string;
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
  salesBreakdown?: { productId: string; sold: number; revenue: number }[];
  whatWentWell?: string;
  whatWentWellEn?: string;
  whatHurt?: string;
  whatHurtEn?: string;
  adviceTomorrow?: string;
  adviceTomorrowEn?: string;
  trendProfit?: number;
  workerNote?: string;
  workerNoteEn?: string;
  eventTitle?: string;
  eventTitleEn?: string;
  eventEffectText?: string;
  eventEffectTextEn?: string;
  missionResults?: MissionResult[];
  streak?: number;
  streakBonus?: number;
  propertyIncome?: number;
  advice: string;
  adviceEn: string;
}

export interface Settings {
  language: Language;
  sound: boolean;
  vibration: boolean;
}

export type WeeklyGoalMetric = 'revenue' | 'units_sold' | 'positive_days' | 'upgrade_count';

export interface WeeklyGoal {
  id: string;
  startDay: number;
  endDay: number;
  metric: WeeklyGoalMetric;
  title: string;
  titleEn: string;
  target: number;
  baseline?: number;
  reward: { cash?: number; xp?: number; reputation?: number };
}

export interface TutorialProgress {
  reportViewed: boolean;
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
  missions: Mission[];
  completedMissionIds: string[];
  weeklyGoals: WeeklyGoal[];
  completedWeeklyGoalIds: string[];
  tutorial: TutorialProgress;
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
  streak: number;
  bestStreak: number;
  /** Number of times the player has prestiged */
  legacyLevel: number;
  /** Day each worker was hired, for tenure bonuses */
  workerHiredOnDay: Record<string, number>;
  /** Which city the player is currently trading in */
  currentCityId: string;
  /** Recent units bought per product — your demand moves prices */
  marketSaturation: Record<string, number>;
  /** Owned properties (stalls, warehouses, buildings) */
  ownedProperties: string[];
  /** Completed story chapter ids */
  completedStoryIds: string[];
  /** Read financial literacy lesson ids */
  readLessonIds: string[];
}
