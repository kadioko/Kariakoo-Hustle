import { GameEvent } from '@/types';

// Events driven by your rivals — they react to your success.
// Selected by rollRivalEvent() in game/rivals.ts based on game state.

export const RIVAL_EVENTS: GameEvent[] = [
  {
    id: 'rival_bofu_undercut',
    type: 'negative',
    title: 'Kaka Bofu Ameshusha Bei',
    titleEn: 'Kaka Bofu Undercuts You',
    description:
      'Kaka Bofu ameweka meza mbele ya yako akiuza bidhaa zako za moto kwa bei chee. Wateja wamehamia kwake leo.',
    descriptionEn:
      'Kaka Bofu set up right in front of you, selling your hot items dirt cheap. Customers drifted to him today.',
    emoji: '🧢',
    probability: 1,
    minLevel: 3,
    effect: { cashPercent: -0.08, reputation: -1 },
  },
  {
    id: 'rival_juma_poach',
    type: 'choice',
    title: 'Mzee Juma Anataka Mfanyakazi Wako',
    titleEn: 'Mzee Juma Wants Your Worker',
    description:
      'Mzee Juma amemnong\'oneza mfanyakazi wako bora ofa ya mshahara mkubwa. Mfanyakazi anasubiri jibu lako.',
    descriptionEn:
      'Mzee Juma whispered a fat salary offer to your best worker. Your worker is waiting to hear from you.',
    emoji: '🎩',
    probability: 1,
    minLevel: 4,
    choices: [
      {
        id: 'counter_offer',
        label: 'Ongeza mshahara (TZS 10,000)',
        labelEn: 'Counter with a raise (TZS 10,000)',
        effect: { cash: -10000, reputation: 1 },
        effectText: 'Mfanyakazi amebaki na moyo mpya. -10,000 TZS, +1 sifa',
        effectTextEn: 'Your worker stays, motivated. -10,000 TZS, +1 rep',
      },
      {
        id: 'let_go',
        label: 'Mwambie afanye maamuzi yake',
        labelEn: 'Let them decide',
        effect: { reputation: -2 },
        effectText: 'Mfanyakazi amevunjika moyo. Timu inakuangalia. -2 sifa',
        effectTextEn: 'Your worker is disheartened. The team noticed. -2 rep',
      },
    ],
  },
  {
    id: 'rival_neema_alliance',
    type: 'choice',
    title: 'Dada Neema Anapendekeza Ushirikiano',
    titleEn: 'Dada Neema Proposes an Alliance',
    description:
      'Dada Neema anakuja na ofa: "Tuunganishe nguvu — mimi nina wateja wa online, wewe una mzigo. Weka TZS 20,000, tugawane soko."',
    descriptionEn:
      'Dada Neema arrives with an offer: "Let\'s join forces — I have online customers, you have stock. Put in TZS 20,000 and we split the market."',
    emoji: '💼',
    probability: 1,
    minLevel: 5,
    choices: [
      {
        id: 'join_alliance',
        label: 'Kubali ushirikiano',
        labelEn: 'Accept the alliance',
        effect: { cash: 15000, reputation: 2 },
        effectText: 'Ushirikiano umelipa haraka: oda za online zimeingia. +15,000 TZS, +2 sifa',
        effectTextEn: 'The alliance pays off fast: online orders roll in. +15,000 TZS, +2 rep',
      },
      {
        id: 'decline_alliance',
        label: 'Kataa kwa heshima',
        labelEn: 'Politely decline',
        effect: {},
        effectText: 'Umebaki huru, lakini Neema ameenda kwa mshindani.',
        effectTextEn: 'You stay independent, but Neema took the deal elsewhere.',
      },
    ],
  },
  {
    id: 'rival_bofu_apology',
    type: 'positive',
    title: 'Kaka Bofu Ameanguka',
    titleEn: 'Kaka Bofu Stumbles',
    description:
      'Mzigo wa Kaka Bofu umekamatwa forodha — bidhaa feki. Wateja wake wamekukimbilia wewe leo.',
    descriptionEn:
      'Kaka Bofu\'s shipment got seized at customs — counterfeits. His customers ran straight to you today.',
    emoji: '📦',
    probability: 1,
    minLevel: 4,
    effect: { cashPercent: 0.1, reputation: 1 },
  },
];
