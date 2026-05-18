import { GameState } from '@/types';

export interface TutorialStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  completed: boolean;
  route?: 'Market' | 'Sell' | 'Reports' | 'Upgrades';
}

export function tutorialSteps(state: GameState): TutorialStep[] {
  const hasBoughtStock =
    state.inventory.length > 0 ||
    state.reports.length > 0 ||
    state.totalRevenue > 0;

  return [
    {
      id: 'buy_stock',
      title: 'Nunua mzigo wa kwanza',
      titleEn: 'Buy your first stock',
      description: 'Anza na bidhaa zenye demand juu na risk ndogo.',
      descriptionEn: 'Start with high-demand, low-risk products.',
      completed: hasBoughtStock,
      route: 'Market',
    },
    {
      id: 'sell_day',
      title: 'Uza siku ya kwanza',
      titleEn: 'Sell your first day',
      description: 'Maliza siku uone mauzo, expenses, na faida.',
      descriptionEn: 'End the day to see sales, expenses, and profit.',
      completed: state.reports.length > 0,
      route: 'Sell',
    },
    {
      id: 'read_report',
      title: 'Soma ripoti ya biashara',
      titleEn: 'Read your business report',
      description: 'Ripoti inaonyesha kilichoenda vizuri na kilichokula faida.',
      descriptionEn: 'Reports show what worked and what hurt profit.',
      completed: state.tutorial.reportViewed,
      route: 'Reports',
    },
    {
      id: 'buy_upgrade',
      title: 'Nunua boresho la kwanza',
      titleEn: 'Buy your first upgrade',
      description: 'Boresho huongeza capacity, demand, au kupunguza losses.',
      descriptionEn: 'Upgrades improve capacity, demand, or reduce losses.',
      completed: state.upgrades.length > 0,
      route: 'Upgrades',
    },
    {
      id: 'reach_100k',
      title: 'Fikisha 100,000 TZS cash',
      titleEn: 'Reach 100,000 TZS cash',
      description: 'Hii inaonyesha umeanza kuzungusha pesa vizuri.',
      descriptionEn: 'This proves you are starting to flip cash well.',
      completed: state.cash >= 100000,
    },
  ];
}

export function tutorialProgressPercent(state: GameState): number {
  const steps = tutorialSteps(state);
  const done = steps.filter((step) => step.completed).length;
  return Math.round((done / steps.length) * 100);
}
