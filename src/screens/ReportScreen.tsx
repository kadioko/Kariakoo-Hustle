import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { findProduct } from '@/data/products';
import { inventoryValue, netWorth } from '@/game/economy';
import { DailyReport } from '@/types';
import { Card } from '@/components/Card';
import { StatRow } from '@/components/StatRow';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';

const ReportItem: React.FC<{ r: DailyReport; lang: 'sw' | 'en' }> = ({ r, lang }) => {
  const profitable = r.netProfit >= 0;
  const best = r.bestSellerId ? findProduct(r.bestSellerId) : null;
  const eventTitle = lang === 'sw' ? r.eventTitle : r.eventTitleEn ?? r.eventTitle;
  return (
    <Card style={[styles.reportItem, { borderLeftColor: profitable ? colors.success : colors.danger }]}>
      <View style={styles.reportTop}>
        <Text style={styles.reportDay}>{t('day', lang)} {r.day}</Text>
        <Text style={[styles.reportNet, { color: profitable ? colors.success : colors.danger }]}>
          {profitable ? '+' : ''}{formatTZS(r.netProfit)}
        </Text>
      </View>
      <Text style={styles.reportSub}>
        {t('revenue', lang)}: {formatTZS(r.revenue)} · {t('expenses', lang)}: {formatTZS(r.expenses)} · {r.unitsSold} units sold
      </Text>
      {(r.qualityLoss ?? 0) > 0 && (
        <Text style={styles.reportQuality}>
          {lang === 'sw' ? 'Hasara ya quality' : 'Quality loss'}: {formatTZS(r.qualityLoss ?? 0)}
          {(r.returnedUnits ?? 0) > 0 ? ` Â· ${r.returnedUnits} ${lang === 'sw' ? 'zimerudishwa' : 'returned'}` : ''}
        </Text>
      )}
      {best && (
        <Text style={styles.reportBest}>
          🔥 {lang === 'sw' ? best.name : best.nameEn}
        </Text>
      )}
      {eventTitle && (
        <Text style={styles.reportEvent}>⚡ {eventTitle}</Text>
      )}
      {r.expenseBreakdown && (
        <Text style={styles.reportBreakdown}>
          {lang === 'sw' ? 'Kodi' : 'Rent'}: {formatTZS(r.expenseBreakdown.rent)} · Transport: {formatTZS(r.expenseBreakdown.transport)}
          {r.expenseBreakdown.workerSalary > 0
            ? ` · ${lang === 'sw' ? 'Mishahara' : 'Salaries'}: ${formatTZS(r.expenseBreakdown.workerSalary)}`
            : ''}
          {r.expenseBreakdown.storage > 0
            ? ` · ${lang === 'sw' ? 'Storage' : 'Storage'}: ${formatTZS(r.expenseBreakdown.storage)}`
            : ''}
          {(r.expenseBreakdown.loanPayment ?? 0) > 0
            ? ` · ${lang === 'sw' ? 'Mkopo' : 'Loan'}: ${formatTZS(r.expenseBreakdown.loanPayment ?? 0)}`
            : ''}
        </Text>
      )}
    </Card>
  );
};

export const ReportScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language } = useGame();
  const lang = language;

  const nw = netWorth(state);
  const invVal = inventoryValue(state);
  const sortedProducts = Object.entries(state.productSalesCount).sort((a, b) => b[1] - a[1]);
  const bestAllTime = sortedProducts[0] ? findProduct(sortedProducts[0][0]) : null;
  const loanBalance = state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`📊 ${t('reports', lang)}`} subtitle={`${t('day', lang)} ${state.day}`} />
      <Button title={`← ${t('back', lang)}`} onPress={() => nav.goBack()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Lifetime stats */}
        <Card>
          <Text style={styles.sectionTitle}>{lang === 'sw' ? 'Takwimu Zote' : 'All-Time Stats'}</Text>
          <StatRow label={t('total_revenue', lang)} value={formatTZS(state.totalRevenue)} highlight />
          <StatRow label={t('total_expenses', lang)} value={formatTZS(state.totalExpenses)} negative />
          <StatRow
            label={t('total_profit', lang)}
            value={formatTZS(state.totalProfit)}
            positive={state.totalProfit >= 0}
            negative={state.totalProfit < 0}
          />
          <StatRow label={t('net_worth', lang)} value={formatTZS(nw)} highlight />
          <StatRow label={t('inventory_value', lang)} value={formatTZS(invVal)} />
          <StatRow
            label={lang === 'sw' ? 'Clearance revenue' : 'Clearance revenue'}
            value={formatTZS(state.totalClearanceRevenue)}
            highlight={state.totalClearanceRevenue > 0}
          />
          <StatRow
            label={lang === 'sw' ? 'Discount ulizotoa' : 'Discount given'}
            value={formatTZS(state.totalClearanceLoss)}
            negative={state.totalClearanceLoss > 0}
          />
          <StatRow
            label={lang === 'sw' ? 'Hasara ya quality' : 'Quality loss'}
            value={formatTZS(state.totalQualityLoss)}
            negative={state.totalQualityLoss > 0}
          />
          <StatRow
            label={lang === 'sw' ? 'Madeni' : 'Loans'}
            value={formatTZS(loanBalance)}
            negative={loanBalance > 0}
          />
          <StatRow label={`⭐ ${t('reputation', lang)}`} value={`${state.reputation}`} />
          {bestAllTime && (
            <StatRow
              label={lang === 'sw' ? 'Best seller zote' : 'All-time best seller'}
              value={`${bestAllTime.emoji} ${lang === 'sw' ? bestAllTime.name : bestAllTime.nameEn} (${sortedProducts[0][1]})`}
            />
          )}
        </Card>

        {/* Day reports */}
        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Historia ya Siku' : 'Day History'}
        </Text>
        {state.reports.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>{t('no_reports', lang)}</Text>
          </View>
        ) : (
          state.reports.map((r) => <ReportItem key={r.day} r={r} lang={lang} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: font.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sectionLabel: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted },
  reportItem: {
    borderLeftWidth: 4,
    borderRadius: radius.lg,
  },
  reportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reportDay: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  reportNet: { fontSize: font.lg, fontWeight: '900' },
  reportSub: { fontSize: font.xs, color: colors.textMuted, lineHeight: 18 },
  reportBest: { fontSize: font.xs, color: colors.primary, fontWeight: '700', marginTop: 4 },
  reportEvent: { fontSize: font.xs, color: colors.warning, marginTop: 2 },
  reportQuality: { fontSize: font.xs, color: colors.danger, fontWeight: '700', marginTop: 4 },
  reportBreakdown: { fontSize: font.xs, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: font.md, textAlign: 'center' },
});
