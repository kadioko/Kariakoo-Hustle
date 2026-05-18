import { DailyReport, GameState } from '@/types';
import { findProduct } from '@/data/products';

export function buildReportInsights(
  stateBeforeDay: GameState,
  report: DailyReport,
): Pick<
  DailyReport,
  | 'whatWentWell'
  | 'whatWentWellEn'
  | 'whatHurt'
  | 'whatHurtEn'
  | 'adviceTomorrow'
  | 'adviceTomorrowEn'
  | 'trendProfit'
  | 'workerNote'
  | 'workerNoteEn'
> {
  const previous = stateBeforeDay.reports[0];
  const trendProfit = previous ? report.netProfit - previous.netProfit : undefined;
  const best = report.bestSellerId ? findProduct(report.bestSellerId) : undefined;
  const worst = report.worstSellerId ? findProduct(report.worstSellerId) : undefined;

  let whatWentWell = report.netProfit >= 0
    ? 'Umefunga siku bila hasara. Cash flow iko hai.'
    : 'Umejifunza kitu leo, hata kama faida haijatoka.';
  let whatWentWellEn = report.netProfit >= 0
    ? 'You finished the day without a loss. Cash flow is alive.'
    : 'You learned something today, even without profit.';

  if (best && report.unitsSold > 0) {
    whatWentWell = `${best.name} imevutia wateja leo. Hii ni signal ya demand.`;
    whatWentWellEn = `${best.nameEn} pulled customers today. That is a demand signal.`;
  }

  let whatHurt = 'Hakuna kitu kikubwa kilichouma sana leo.';
  let whatHurtEn = 'Nothing major hurt the business today.';
  if (report.expenses > report.grossProfit) {
    whatHurt = 'Matumizi yamekula sehemu kubwa ya gross profit.';
    whatHurtEn = 'Expenses ate a big part of gross profit.';
  } else if ((report.qualityLoss ?? 0) > 0) {
    whatHurt = 'Returns na quality loss zimepunguza mauzo halisi.';
    whatHurtEn = 'Returns and quality loss reduced real sales.';
  } else if (worst && report.unitsRemaining > report.unitsSold) {
    whatHurt = `${worst.name} haijaenda vizuri. Usijaze stock polepole kesho.`;
    whatHurtEn = `${worst.nameEn} moved slowly. Do not overfill slow stock tomorrow.`;
  }

  let adviceTomorrow = 'Kesho nunua kwa kiasi, uza, soma report, rudia.';
  let adviceTomorrowEn = 'Tomorrow, buy carefully, sell, read the report, repeat.';
  if (stateBeforeDay.cash < Math.max(20000, report.expenses * 3)) {
    adviceTomorrow = 'Kesho linda cash kwanza kabla ya kununua mzigo mkubwa.';
    adviceTomorrowEn = 'Tomorrow, protect cash before buying a large batch.';
  } else if (best) {
    adviceTomorrow = `Kesho unaweza kuongeza kidogo ${best.name}, lakini usisahau diversification.`;
    adviceTomorrowEn = `Tomorrow you can add a little more ${best.nameEn}, but keep some diversification.`;
  }

  let workerNote: string | undefined;
  let workerNoteEn: string | undefined;
  if (stateBeforeDay.workers.includes('sales_assistant') && report.unitsSold > 0) {
    workerNote = 'Muuzaji Msaidizi amesaidia kuvuta wateja na kusukuma mauzo leo.';
    workerNoteEn = 'Sales Assistant helped pull customers and push sales today.';
  } else if (stateBeforeDay.workers.includes('stock_manager') && (report.qualityLoss ?? 0) === 0) {
    workerNote = 'Meneja wa Mzigo amesaidia stock ibaki salama leo.';
    workerNoteEn = 'Stock Manager helped keep stock safe today.';
  }

  return {
    whatWentWell,
    whatWentWellEn,
    whatHurt,
    whatHurtEn,
    adviceTomorrow,
    adviceTomorrowEn,
    trendProfit,
    workerNote,
    workerNoteEn,
  };
}
