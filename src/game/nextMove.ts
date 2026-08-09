import { GameState } from '@/types';
import { calcDailyExpenses, inventoryUnits } from './economy';
import { UPGRADES } from '@/data/upgrades';

export type NextMoveRoute = 'Market' | 'Sell' | 'Reports' | 'Upgrades';

export interface NextMove {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  action: string;
  actionEn: string;
  route: NextMoveRoute;
}

/**
 * Gives the player one useful recommendation without taking control away.
 * Ordering matters: unresolved decisions and a healthy cashflow come first.
 */
export function nextMoveFor(state: GameState): NextMove {
  const stock = inventoryUnits(state);
  const expenses = calcDailyExpenses(state).total;
  const affordableUpgrade = UPGRADES.some(
    (upgrade) =>
      !state.upgrades.includes(upgrade.id) &&
      state.level >= upgrade.unlockLevel &&
      state.cash >= upgrade.cost,
  );

  if (state.pendingEventId) {
    return {
      id: 'pending_event',
      emoji: '!',
      title: 'Tukio linakusubiri',
      titleEn: 'A decision is waiting',
      body: 'Jibu tukio la leo kabla hujaendelea na biashara.',
      bodyEn: 'Respond to today\'s event before moving on.',
      action: 'Jibu tukio',
      actionEn: 'Respond',
      route: 'Sell',
    };
  }

  if (stock === 0) {
    return {
      id: 'buy_stock',
      emoji: '+',
      title: 'Pesa izunguke',
      titleEn: 'Put your cash to work',
      body: 'Nunua bidhaa moja au mbili zenye demand nzuri ili uanze mzunguko.',
      bodyEn: 'Buy one or two products with healthy demand to start your cycle.',
      action: 'Nenda sokoni',
      actionEn: 'Open market',
      route: 'Market',
    };
  }

  if (state.reports.length === 0) {
    return {
      id: 'first_sale',
      emoji: '*',
      title: 'Soko liko tayari',
      titleEn: 'The market is ready',
      body: 'Maliza siku ya kwanza uone bidhaa gani imeenda na gharama zimefika wapi.',
      bodyEn: 'End your first day to learn what sold and where your costs landed.',
      action: 'Uza leo',
      actionEn: 'Sell today',
      route: 'Sell',
    };
  }

  if (state.cash < Math.max(expenses * 3, 15000)) {
    return {
      id: 'protect_cashflow',
      emoji: '!',
      title: 'Linda cashflow',
      titleEn: 'Protect your cashflow',
      body: 'Una cash ya siku chache tu. Nunua mzigo wa haraka na usifunge pesa yote.',
      bodyEn: 'You only have a few days of cash. Choose fast stock and keep a buffer.',
      action: 'Chagua mzigo',
      actionEn: 'Choose stock',
      route: 'Market',
    };
  }

  if (state.reports[0]?.netProfit < 0) {
    return {
      id: 'learn_from_loss',
      emoji: '?',
      title: 'Geuza hasara kuwa somo',
      titleEn: 'Turn the loss into a lesson',
      body: 'Soma ripoti kisha punguza bidhaa iliyokaa au gharama iliyokula faida.',
      bodyEn: 'Review the report, then reduce the slow stock or cost that hurt profit.',
      action: 'Soma ripoti',
      actionEn: 'Review report',
      route: 'Reports',
    };
  }

  if (affordableUpgrade) {
    return {
      id: 'reinvest',
      emoji: '^',
      title: 'Reinvest kwa akili',
      titleEn: 'Reinvest with purpose',
      body: 'Biashara inaendelea. Angalia boresho litakaloongeza capacity au mauzo.',
      bodyEn: 'Business is moving. Check which upgrade will improve capacity or sales.',
      action: 'Angalia maboresho',
      actionEn: 'View upgrades',
      route: 'Upgrades',
    };
  }

  return {
    id: 'sell_day',
    emoji: '>',
    title: 'Endelea kuzungusha pesa',
    titleEn: 'Keep the money moving',
    body: 'Mzigo upo na cashflow iko sawa. Maliza siku uone biashara imefika wapi.',
    bodyEn: 'You have stock and a healthy buffer. End the day and keep learning.',
    action: 'Uza leo',
    actionEn: 'Sell today',
    route: 'Sell',
  };
}
