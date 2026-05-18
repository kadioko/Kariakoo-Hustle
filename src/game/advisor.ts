import { findProduct } from '@/data/products';
import { GameState } from '@/types';
import { calcDailyExpenses, inventoryUnits } from './economy';

export interface AdvisorWarning {
  id: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  tone: 'warning' | 'danger' | 'info';
  emoji: string;
}

export function businessAdvisorWarnings(state: GameState): AdvisorWarning[] {
  const warnings: AdvisorWarning[] = [];
  const expenses = calcDailyExpenses(state);
  const runwayDays = expenses.total > 0 ? state.cash / expenses.total : 99;
  const stockUnits = inventoryUnits(state);
  const riskyUnits = state.inventory.reduce((sum, item) => {
    const product = findProduct(item.productId);
    return sum + (product?.risk === 'high' ? item.quantity : 0);
  }, 0);
  const slowUnits = state.inventory.reduce((sum, item) => {
    const product = findProduct(item.productId);
    return sum + (product?.demand === 'low' ? item.quantity : 0);
  }, 0);
  const lastReport = state.reports[0];

  if (runwayDays < 4) {
    warnings.push({
      id: 'low_cash',
      title: 'Cash imebaki kidogo',
      titleEn: 'Cash is getting tight',
      body: 'Boss, usinunue stock yote. Baki na hela ya rent, transport, na surprise za mtaani.',
      bodyEn: 'Boss, do not spend every coin on stock. Keep cash for rent, transport, and surprises.',
      tone: 'danger',
      emoji: '💸',
    });
  }

  if (expenses.rent > Math.max(3000, state.cash * 0.08)) {
    warnings.push({
      id: 'rent_pressure',
      title: 'Rent inakula faida',
      titleEn: 'Rent is eating profit',
      body: 'Hakikisha eneo hili lina mauzo ya kutosha kabla hujapanua tena.',
      bodyEn: 'Make sure this location earns enough before expanding again.',
      tone: 'warning',
      emoji: '🏠',
    });
  }

  if (stockUnits > 0 && riskyUnits / stockUnits >= 0.35) {
    warnings.push({
      id: 'risky_stock',
      title: 'Stock yako ni risky sana',
      titleEn: 'Your stock is too risky',
      body: 'Changanya na bidhaa za risk ndogo ili returns zisikukate nguvu.',
      bodyEn: 'Mix in lower-risk goods so returns do not crush your day.',
      tone: 'warning',
      emoji: '⚠️',
    });
  }

  if (stockUnits > 12 && slowUnits / stockUnits >= 0.35) {
    warnings.push({
      id: 'slow_stock',
      title: 'Mzigo mwingi hauendi haraka',
      titleEn: 'Too much slow stock',
      body: 'Jaribu clearance au nunua bidhaa zenye demand ya juu zaidi kesho.',
      bodyEn: 'Try clearance or buy higher-demand products tomorrow.',
      tone: 'info',
      emoji: '📦',
    });
  }

  if (lastReport && lastReport.netProfit < 0) {
    warnings.push({
      id: 'loss_yesterday',
      title: 'Jana kulikuwa na hasara',
      titleEn: 'Yesterday was a loss',
      body: 'Angalia report: expenses, slow movers, au quality loss ndio chanzo kikubwa?',
      bodyEn: 'Check the report: were expenses, slow movers, or quality losses the main cause?',
      tone: 'danger',
      emoji: '📉',
    });
  }

  return warnings.slice(0, 3);
}
