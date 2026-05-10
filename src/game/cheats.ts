export interface CashCheat {
  code: string;
  amount: number;
  message: string;
  messageEn: string;
}

export const CASH_CHEATS: CashCheat[] = [
  {
    code: 'KARIOO50K',
    amount: 50000,
    message: 'Cheat imeongeza 50,000 TZS.',
    messageEn: 'Cheat added 50,000 TZS.',
  },
  {
    code: 'KARIOO2M5',
    amount: 2500000,
    message: 'Cheat imeongeza 2,500,000 TZS.',
    messageEn: 'Cheat added 2,500,000 TZS.',
  },
  {
    code: 'EMPIRE30M',
    amount: 30000000,
    message: 'Cheat imeongeza 30,000,000 TZS.',
    messageEn: 'Cheat added 30,000,000 TZS.',
  },
];

export function normalizeCheatCode(rawCode: string): string {
  return rawCode.trim().toUpperCase().replace(/\s+/g, '');
}

export function findCashCheat(rawCode: string): CashCheat | undefined {
  const code = normalizeCheatCode(rawCode);
  return CASH_CHEATS.find((cheat) => cheat.code === code);
}
