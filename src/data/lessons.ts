import { GameState } from '@/types';

// Financial literacy lessons ("Masomo ya Biashara").
// Each lesson links a real concept to something the player already does in-game.
// Reading a lesson for the first time earns XP.

export interface Lesson {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  /** Returns true when the lesson is unlocked */
  unlocked: (state: GameState) => boolean;
  unlockHint: string;
  unlockHintEn: string;
}

export const LESSON_XP = 15;

export const LESSONS: Lesson[] = [
  {
    id: 'margin',
    emoji: '📐',
    title: 'Faida ya Pato (Margin)',
    titleEn: 'Profit Margin',
    body:
      'Faida si bei ya kuuza — ni tofauti kati ya bei ya kununua na ya kuuza. Bidhaa ya bei ndogo yenye margin ya 60% inaweza kukuletea zaidi ya bidhaa kubwa yenye margin ya 20%. Kwenye soko, angalia "+%" kabla ya kununua. Katika maisha halisi: kabla ya kuanza biashara yoyote, hesabu margin kwanza — wengi wanauza kwa hasara bila kujua.',
    bodyEn:
      "Profit isn't the selling price — it's the gap between what you pay and what you charge. A cheap item at 60% margin can beat a big-ticket item at 20%. In the market screen, check the +% pill before buying. In real life: before starting any business, calculate margin first — many people sell at a loss without knowing it.",
    unlocked: () => true,
    unlockHint: 'Inapatikana mwanzoni',
    unlockHintEn: 'Available from the start',
  },
  {
    id: 'cash_flow',
    emoji: '💧',
    title: 'Mzunguko wa Pesa (Cash Flow)',
    titleEn: 'Cash Flow',
    body:
      'Biashara haifi kwa kukosa faida — inakufa kwa kukosa pesa taslimu. Ukinunua mzigo wote kwa pesa zako zote, huna cha kulipia kodi na usafiri kesho. Daima acha akiba ya matumizi ya siku 3-4. Hii ndiyo sababu game inakuonya ukitaka kutumia cash nyingi mara moja.',
    bodyEn:
      "Businesses don't die from lack of profit — they die from running out of cash. Spend everything on stock and you can't pay tomorrow's rent and transport. Always keep 3-4 days of expenses in reserve. That's why the game warns you before you tie up too much cash.",
    unlocked: (s) => s.day >= 3,
    unlockHint: 'Fikia siku ya 3',
    unlockHintEn: 'Reach day 3',
  },
  {
    id: 'stock_turn',
    emoji: '🔄',
    title: 'Kuzungusha Mzigo (Stock Turnover)',
    titleEn: 'Stock Turnover',
    body:
      'Mzigo uliokaa ni pesa iliyolala. Bidhaa ya "demand juu" inayouzwa kila siku ni bora kuliko ya faida kubwa inayokaa wiki mbili. Wafanyabiashara wa Kariakoo wanasema: "Pesa iko kwenye mzunguko, si kwenye stoo." Clearance ya hasara kidogo mara nyingi ni bora kuliko kushikilia mzigo usiouzwa.',
    bodyEn:
      'Sitting stock is sleeping money. A high-demand item that sells daily beats a high-margin item that sits for two weeks. Kariakoo traders say: "The money is in the rotation, not the storeroom." A small clearance loss often beats holding dead stock.',
    unlocked: (s) => s.totalRevenue > 0,
    unlockHint: 'Fanya mauzo yako ya kwanza',
    unlockHintEn: 'Make your first sale',
  },
  {
    id: 'debt',
    emoji: '🏦',
    title: 'Deni Jema na Deni Baya',
    titleEn: 'Good Debt vs Bad Debt',
    body:
      'Mkopo unaonunua mzigo unaozunguka haraka ni deni jema — unalipa riba na bado unabaki na faida. Mkopo wa matumizi ni deni baya. Kanuni: kabla ya kukopa, hakikisha faida unayotarajia ni kubwa kuliko riba. Kwenye game, sifa nzuri inapunguza riba — kama maisha halisi ambapo credit history yako inaamua bei ya mkopo.',
    bodyEn:
      "A loan that buys fast-turning stock is good debt — you pay the interest and still keep a profit. A loan for consumption is bad debt. Rule: before borrowing, be sure expected profit beats the interest. In the game, good reputation lowers your rate — just like real life, where your credit history sets your loan price.",
    unlocked: (s) => s.loans.length > 0 || s.day >= 7,
    unlockHint: 'Chukua mkopo au fikia siku 7',
    unlockHintEn: 'Take a loan or reach day 7',
  },
  {
    id: 'diversify',
    emoji: '🧺',
    title: 'Usiweke Mayai Kapu Moja',
    titleEn: "Don't Put All Eggs in One Basket",
    body:
      'Ukinunua bidhaa moja tu, siku ambayo haiendi sokoni unalala njaa. Changanya: bidhaa za uhakika (risk ndogo) na chache za faida kubwa (risk juu). Pia game inakuadhibu kwa ku-flood soko na bidhaa moja — bei zinapanda na mauzo yanapungua. Hii ni "diversification" — kanuni ya kwanza ya uwekezaji popote duniani.',
    bodyEn:
      "Stock only one product and you starve the day it doesn't move. Mix steady low-risk items with a few high-margin gambles. The game also punishes flooding the market with one product — your buy prices rise and sales slow down. This is diversification — the first rule of investing anywhere on earth.",
    unlocked: (s) => s.day >= 5,
    unlockHint: 'Fikia siku ya 5',
    unlockHintEn: 'Reach day 5',
  },
  {
    id: 'reputation',
    emoji: '⭐',
    title: 'Sifa ni Mtaji',
    titleEn: 'Reputation is Capital',
    body:
      'Kariakoo, jina lako linakutangulia. Sifa nzuri inakuletea wateja wa kurudia, bei nzuri za mkopo, na nguvu ya majadiliano. Sifa mbaya inagharimu zaidi ya pesa. Kwenye game, kila return ya bidhaa mbovu inakula sifa — kama maisha halisi: uza quality, lipa madeni kwa wakati, tendea watu haki.',
    bodyEn:
      'In Kariakoo, your name arrives before you do. Good reputation brings repeat customers, better loan rates, and bargaining power. Bad reputation costs more than money. In the game, every faulty return eats reputation — like real life: sell quality, pay debts on time, treat people fairly.',
    unlocked: (s) => s.reputation >= 5 || s.reputation <= -3,
    unlockHint: 'Fikia sifa 5 (au -3)',
    unlockHintEn: 'Reach 5 reputation (or -3)',
  },
  {
    id: 'negotiation',
    emoji: '🤝',
    title: 'Majadiliano (Kubembea Bei)',
    titleEn: 'The Art of Haggling',
    body:
      'Bei ya kwanza si bei ya mwisho — lakini majadiliano ni sanaa. Omba punguzo dogo mara nyingi, si kubwa mara moja. Mnunuzi wa heshima na historia nzuri anapata bei nzuri zaidi. Na ujue kikomo: ukisukuma sana, muuzaji anafunga mlango. Kwenye game, jaribu ku-haggle kwenye oda za vipande 10+.',
    bodyEn:
      "The first price is never the final price — but haggling is an art. Ask for small discounts often, not huge ones once. A respectful buyer with good history gets better prices. And know the limit: push too hard and the supplier shuts the door. In the game, try haggling on orders of 10+ units.",
    unlocked: (s) => s.level >= 2,
    unlockHint: 'Fikia level 2',
    unlockHintEn: 'Reach level 2',
  },
  {
    id: 'assets',
    emoji: '🏠',
    title: 'Mali Zinazokulipa',
    titleEn: 'Assets That Pay You',
    body:
      'Kodi unayolipa kila siku ni pesa inayotoka. Mali unayomiliki ni pesa inayoingia. Hatua ya kwanza ya utajiri: punguza gharama za kudumu (nunua kiti chako). Hatua ya pili: nunua mali zinazokulipa (duka la kupangisha). Tofauti kati ya tajiri na maskini si mshahara — ni nani analipwa na mali.',
    bodyEn:
      "Rent you pay daily is money leaving. Property you own is money arriving. Step one of wealth: cut fixed costs (buy your own stall). Step two: buy assets that pay YOU (a shop you rent out). The difference between rich and poor isn't salary — it's who gets paid by assets.",
    unlocked: (s) => s.level >= 3,
    unlockHint: 'Fikia level 3',
    unlockHintEn: 'Reach level 3',
  },
  {
    id: 'compound',
    emoji: '📈',
    title: 'Nguvu ya Mfululizo (Compounding)',
    titleEn: 'The Power of Compounding',
    body:
      'Faida ndogo ya kila siku, ikirudishwa kwenye biashara, inakuwa mlima. TZS 10,000 ya faida kila siku ikiwekezwa tena ni zaidi ya milioni 3 kwa mwaka — kabla ya ukuaji. Hii ndiyo sababu streak ya siku za faida ina bonasi kwenye game: mfululizo ndio siri, si siku moja kubwa.',
    bodyEn:
      "Small daily profits, reinvested, become a mountain. TZS 10,000 of daily profit reinvested is over 3 million a year — before growth. That's why profit streaks earn a bonus in the game: consistency is the secret, not one big day.",
    unlocked: (s) => s.bestStreak >= 3,
    unlockHint: 'Pata streak ya siku 3',
    unlockHintEn: 'Get a 3-day profit streak',
  },
];
