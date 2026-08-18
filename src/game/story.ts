import { GameState } from '@/types';
import { netWorth } from './economy';
import { RIVALS, rivalWorth } from './rivals';

// Story campaign: chapters with characters, goals, and rewards.
// The current chapter shows on the dashboard; completing it advances the tale.

export type StoryGoal =
  | { type: 'first_sale' }
  | { type: 'total_revenue'; value: number }
  | { type: 'reputation'; value: number }
  | { type: 'day'; value: number; minReputation?: number }
  | { type: 'beat_rival'; rivalId: string }
  | { type: 'own_property' }
  | { type: 'hire_worker' }
  | { type: 'prestige' };

export interface StoryChapter {
  id: string;
  character: string;
  characterEn: string;
  emoji: string;
  title: string;
  titleEn: string;
  narrative: string;
  narrativeEn: string;
  goalText: string;
  goalTextEn: string;
  goal: StoryGoal;
  reward: { cash?: number; xp?: number; reputation?: number };
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1_mama',
    character: 'Mama',
    characterEn: 'Mama',
    emoji: '👵',
    title: 'Baraka ya Mama',
    titleEn: "Mama's Blessing",
    narrative:
      'Mama amekupa baraka na mtaji wake wa mwisho: "Mwanangu, Kariakoo si mchezo. Uza kitu chako cha kwanza, nione kama una damu ya biashara."',
    narrativeEn:
      'Mama gave you her blessing and her last savings: "My child, Kariakoo is no joke. Make your first sale — show me you have trader\'s blood."',
    goalText: 'Maliza mauzo yako ya kwanza',
    goalTextEn: 'Complete your first sale',
    goal: { type: 'first_sale' },
    reward: { cash: 10000, xp: 25 },
  },
  {
    id: 'ch2_jirani',
    character: 'Mzee Salim, jirani',
    characterEn: 'Mzee Salim, the neighbor',
    emoji: '🧓',
    title: 'Jicho la Jirani',
    titleEn: "The Neighbor's Eye",
    narrative:
      'Mzee Salim mwenye duka jirani anakuangalia: "Vijana wengi wanaanza, wachache wanadumu. Nionyeshe mauzo ya laki mbili, nitakuamini."',
    narrativeEn:
      'Mzee Salim from the next stall watches you: "Many youths start, few last. Show me 200K in sales and I\'ll believe in you."',
    goalText: 'Fikia mauzo jumla ya TZS 200,000',
    goalTextEn: 'Reach TZS 200,000 total revenue',
    goal: { type: 'total_revenue', value: 200000 },
    reward: { cash: 15000, reputation: 2, xp: 40 },
  },
  {
    id: 'ch3_boss',
    character: 'Wewe',
    characterEn: 'You',
    emoji: '🧑‍💼',
    title: 'Mkono wa Kuaminika',
    titleEn: 'A Trusted Hand',
    narrative:
      'Biashara inakua na mikono miwili haitoshi tena. Wakati umefika wa kuajiri msaidizi wako wa kwanza — boss halisi hajengi peke yake.',
    narrativeEn:
      "Business is growing and two hands are no longer enough. Time to hire your first helper — a real boss doesn't build alone.",
    goalText: 'Ajiri mfanyakazi wako wa kwanza',
    goalTextEn: 'Hire your first worker',
    goal: { type: 'hire_worker' },
    reward: { cash: 12000, xp: 50 },
  },
  {
    id: 'ch4_inspekta',
    character: 'Inspekta Mushi',
    characterEn: 'Inspector Mushi',
    emoji: '🕵️',
    title: 'Jicho la Inspekta',
    titleEn: "The Inspector's Gaze",
    narrative:
      'Inspekta Mushi anapita Kariakoo akitafuta wafanyabiashara wasio na nidhamu. Endesha biashara safi: fikia siku 15 ukiwa na sifa nzuri, na hatakuwa na cha kukushika.',
    narrativeEn:
      'Inspector Mushi prowls Kariakoo hunting sloppy traders. Run a clean business: reach day 15 with good reputation and he\'ll have nothing on you.',
    goalText: 'Fikia siku 15 na sifa 5+',
    goalTextEn: 'Reach day 15 with 5+ reputation',
    goal: { type: 'day', value: 15, minReputation: 5 },
    reward: { reputation: 3, xp: 60 },
  },
  {
    id: 'ch5_bofu',
    character: 'Kaka Bofu',
    characterEn: 'Kaka Bofu',
    emoji: '🧢',
    title: 'Kivuli cha Mshindani',
    titleEn: "The Rival's Shadow",
    narrative:
      'Kaka Bofu anatangaza mtaani: "Huyu mgeni hawezi kunifikia!" Wateja wanasikiliza. Mzidi kwa thamani ya biashara, umnyamazishe.',
    narrativeEn:
      'Kaka Bofu boasts in the streets: "This newcomer can\'t touch me!" Customers are listening. Beat his net worth and silence him.',
    goalText: 'Zidi thamani ya Kaka Bofu',
    goalTextEn: "Beat Kaka Bofu's net worth",
    goal: { type: 'beat_rival', rivalId: 'kaka_bofu' },
    reward: { cash: 25000, reputation: 2, xp: 80 },
  },
  {
    id: 'ch6_mwenye_nyumba',
    character: 'Bi. Zuhura, mwenye nyumba',
    characterEn: 'Bi. Zuhura, the landlady',
    emoji: '🗝️',
    title: 'Funguo Zako Mwenyewe',
    titleEn: 'Keys of Your Own',
    narrative:
      'Bi. Zuhura anapandisha kodi tena. "Kama hupendi, nunua kwako." Sawa basi — wakati umefika wa kumiliki, si kupanga.',
    narrativeEn:
      'Bi. Zuhura raises the rent again. "If you don\'t like it, buy your own." Fine then — time to own, not rent.',
    goalText: 'Nunua mali yako ya kwanza',
    goalTextEn: 'Buy your first property',
    goal: { type: 'own_property' },
    reward: { cash: 50000, xp: 120 },
  },
  {
    id: 'ch7_jina',
    character: 'Mtaa mzima',
    characterEn: 'The whole street',
    emoji: '📣',
    title: 'Jina Linajulikana',
    titleEn: 'A Name That Carries',
    narrative:
      'Sasa wanakutaja kwenye vijiwe vya kahawa: "Yule bosi wa Kariakoo..." Fikia sifa 30 — jina lako liwe dhamana yako.',
    narrativeEn:
      'They speak of you at the coffee stands now: "That Kariakoo boss..." Reach 30 reputation — let your name be your collateral.',
    goalText: 'Fikia sifa 30',
    goalTextEn: 'Reach 30 reputation',
    goal: { type: 'reputation', value: 30 },
    reward: { cash: 40000, xp: 150 },
  },
  {
    id: 'ch8_ukoo',
    character: 'Mama',
    characterEn: 'Mama',
    emoji: '🏛️',
    title: 'Urithi wa Ukoo',
    titleEn: 'The Family Legacy',
    narrative:
      'Mama anatabasamu: "Umefika mbali, mwanangu. Sasa jenga kitu kitakachodumu zaidi yako — anzisha ukoo." Fikia prestige yako ya kwanza.',
    narrativeEn:
      'Mama smiles: "You have come far, my child. Now build something that outlives you — start a legacy." Reach your first prestige.',
    goalText: 'Anzisha ukoo (prestige) mara ya kwanza',
    goalTextEn: 'Prestige for the first time',
    goal: { type: 'prestige' },
    reward: { cash: 100000, reputation: 5, xp: 300 },
  },
];

export function goalMet(state: GameState, goal: StoryGoal): boolean {
  switch (goal.type) {
    case 'first_sale':
      return state.hasMadeFirstSale;
    case 'total_revenue':
      return state.totalRevenue >= goal.value;
    case 'reputation':
      return state.reputation >= goal.value;
    case 'day':
      return state.day >= goal.value
        && (goal.minReputation === undefined || state.reputation >= goal.minReputation);
    case 'beat_rival': {
      const rival = RIVALS.find((r) => r.id === goal.rivalId);
      if (!rival) return true;
      return netWorth(state) > rivalWorth(rival, state.day);
    }
    case 'own_property':
      return state.ownedProperties.length > 0;
    case 'hire_worker':
      return state.workers.length > 0;
    case 'prestige':
      return state.legacyLevel > 0;
  }
}

/** Progress 0..1 toward the goal, for the dashboard progress bar. */
export function goalProgress(state: GameState, goal: StoryGoal): number {
  switch (goal.type) {
    case 'first_sale':
      return state.hasMadeFirstSale ? 1 : 0;
    case 'total_revenue':
      return Math.min(1, state.totalRevenue / goal.value);
    case 'reputation':
      return Math.min(1, Math.max(0, state.reputation) / goal.value);
    case 'day': {
      const dayProgress = Math.min(1, state.day / goal.value);
      if (goal.minReputation === undefined) return dayProgress;
      const reputationProgress = Math.min(1, Math.max(0, state.reputation) / goal.minReputation);
      return Math.min(dayProgress, reputationProgress);
    }
    case 'beat_rival': {
      const rival = RIVALS.find((r) => r.id === goal.rivalId);
      if (!rival) return 1;
      return Math.min(1, netWorth(state) / Math.max(1, rivalWorth(rival, state.day)));
    }
    case 'own_property':
      return state.ownedProperties.length > 0 ? 1 : 0;
    case 'hire_worker':
      return state.workers.length > 0 ? 1 : 0;
    case 'prestige':
      return state.legacyLevel > 0 ? 1 : 0;
  }
}

export function currentChapter(state: GameState): StoryChapter | undefined {
  return STORY_CHAPTERS.find((ch) => !state.completedStoryIds.includes(ch.id));
}

/** Evaluate story progression; completes at most one chapter per call. */
export function evaluateStory(state: GameState): {
  state: GameState;
  completedChapter?: StoryChapter;
} {
  const chapter = currentChapter(state);
  if (!chapter || !goalMet(state, chapter.goal)) return { state };

  const next: GameState = {
    ...state,
    cash: state.cash + (chapter.reward.cash ?? 0),
    xp: state.xp + (chapter.reward.xp ?? 0),
    reputation: Math.max(-10, Math.min(100, state.reputation + (chapter.reward.reputation ?? 0))),
    completedStoryIds: [...state.completedStoryIds, chapter.id],
  };
  return { state: next, completedChapter: chapter };
}
