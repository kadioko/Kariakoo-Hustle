import { PRODUCTS, findProduct } from '@/data/products';
import { UPGRADES } from '@/data/upgrades';
import { DailyReport, GameState } from '@/types';
import { calcDailyExpenses, inventoryUnits } from './economy';

export type TomorrowPlanRoute = 'Dashboard' | 'Market' | 'Inventory' | 'Upgrades' | 'Reports' | 'Bank';

export interface TomorrowPlanAction {
  id: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  route: TomorrowPlanRoute;
  /** Optional product to open directly when the action leads to the market. */
  productId?: string;
  tone: 'primary' | 'warning' | 'danger';
}

/** Turns the latest report into three practical, non-automatic next actions. */
export function tomorrowPlan(state: GameState, report: DailyReport): TomorrowPlanAction[] {
  const actions: TomorrowPlanAction[] = [];
  const usedRoutes = new Set<TomorrowPlanRoute>();
  const add = (action: TomorrowPlanAction) => {
    if (actions.length >= 3 || usedRoutes.has(action.route)) return;
    actions.push(action);
    usedRoutes.add(action.route);
  };

  const best = report.bestSellerId ? findProduct(report.bestSellerId) : undefined;
  const worst = report.worstSellerId ? findProduct(report.worstSellerId) : undefined;
  const expenses = calcDailyExpenses(state).total;
  const stock = inventoryUnits(state);

  if ((report.qualityLoss ?? 0) > 0 || (report.returnedUnits ?? 0) > 0) {
    add({
      id: 'protect_quality',
      title: 'Linda quality kesho',
      titleEn: 'Protect quality tomorrow',
      body: 'Chagua supplier wa Kawaida au Quality Juu kupunguza returns.',
      bodyEn: 'Choose Standard or Premium suppliers to reduce returns.',
      route: 'Market',
      tone: 'danger',
    });
  }

  if (worst && report.unitsRemaining > report.unitsSold) {
    add({
      id: 'rotate_stock',
      title: `Kagua ${worst.name}`,
      titleEn: `Review ${worst.nameEn}`,
      body: 'Mzigo umebaki mwingi. Punguza batch au tumia clearance kwa tahadhari.',
      bodyEn: 'A lot remains. Reduce the next batch or use clearance carefully.',
      route: 'Inventory',
      tone: 'warning',
    });
  }

  if (report.netProfit < 0) {
    add({
      id: 'review_loss',
      title: 'Tafuta chanzo cha hasara',
      titleEn: 'Find the source of the loss',
      body: 'Linganisha gross profit, gharama, na quality loss kabla ya kununua tena.',
      bodyEn: 'Compare gross profit, expenses, and quality loss before buying again.',
      route: 'Reports',
      tone: 'danger',
    });
  }

  if (best && state.cash > Math.max(15000, expenses * 2)) {
    add({
      id: 'restock_winner',
      title: `Ongeza kidogo ${best.name}`,
      titleEn: `Restock a little ${best.nameEn}`,
      body: 'Iliuza vizuri leo. Nunua batch ndogo bila kufunga cash yote.',
      bodyEn: 'It sold well today. Buy a small batch without tying up all your cash.',
      route: 'Market',
      productId: best.id,
      tone: 'primary',
    });
  }

  const affordableUpgrade = UPGRADES.find(
    (upgrade) => !state.upgrades.includes(upgrade.id)
      && state.level >= upgrade.unlockLevel
      && state.cash >= upgrade.cost,
  );
  if (affordableUpgrade) {
    add({
      id: 'reinvest_upgrade',
      title: 'Reinvest kwenye biashara',
      titleEn: 'Reinvest in the business',
      body: `${affordableUpgrade.name} inaweza kuimarisha mzunguko unaofuata.`,
      bodyEn: `${affordableUpgrade.nameEn} can strengthen your next trading cycle.`,
      route: 'Upgrades',
      tone: 'primary',
    });
  }

  if (state.cash < 5000 && stock === 0) {
    add({
      id: 'capital_rescue',
      title: 'Rudisha mtaji kwa tahadhari',
      titleEn: 'Recover working capital carefully',
      body: 'Huna cash wala stock. Kagua mkopo mdogo na malipo yake ya kila siku.',
      bodyEn: 'You have no cash or stock. Review a small loan and its daily payment.',
      route: 'Bank',
      tone: 'danger',
    });
  }

  add({
    id: 'market_check',
    title: 'Angalia bei mpya',
    titleEn: 'Check the new prices',
    body: 'Bei na demand zimebadilika kwa siku mpya. Tafuta opportunity kabla ya kununua.',
    bodyEn: 'Prices and demand changed for the new day. Find the opportunity before buying.',
    route: 'Market',
    tone: 'primary',
  });
  add({
    id: 'stock_check',
    title: 'Panga mzigo uliobaki',
    titleEn: 'Review remaining stock',
    body: 'Kagua quality, margin, na stock iliyokaa kabla ya kuongeza batch.',
    bodyEn: 'Review quality, margin, and aging stock before adding another batch.',
    route: 'Inventory',
    tone: 'warning',
  });
  add({
    id: 'daily_goals',
    title: 'Panga malengo ya siku mpya',
    titleEn: 'Plan the new day',
    body: 'Rudi dashboard uone misheni, cash runway, na hatua bora inayofuata.',
    bodyEn: 'Return to the dashboard for missions, cash runway, and your next best move.',
    route: 'Dashboard',
    tone: 'primary',
  });

  return actions;
}
