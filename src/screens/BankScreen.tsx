import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { buzz } from '@/utils/haptics';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Pill } from '@/components/Pill';
import { earlyRepayAmount, loanOffers, MAX_ACTIVE_LOANS } from '@/game/bank';

export const BankScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, takeLoan, repayLoan } = useGame();
  const toast = useToast();
  const lang = language;

  const offers = loanOffers(state);
  const atLoanLimit = state.loans.length >= MAX_ACTIVE_LOANS;

  const handleTake = (offerId: string, name: string, principal: number) => {
    Alert.alert(
      lang === 'sw' ? 'Chukua mkopo?' : 'Take this loan?',
      lang === 'sw'
        ? `${name}: utapokea ${formatTZS(principal)} sasa hivi. Malipo yatakatwa kila siku.`
        : `${name}: you receive ${formatTZS(principal)} now. Payments are deducted daily.`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('yes', lang),
          onPress: () => {
            const res = takeLoan(offerId);
            if (res.ok) {
              buzz(state.settings, 'success');
              toast.success(
                lang === 'sw' ? 'Mkopo umepokelewa!' : 'Loan received!',
                `+${formatTZS(principal)}`,
              );
            } else {
              toast.error(
                res.reason === 'too_many_loans'
                  ? lang === 'sw' ? `Mikopo ${MAX_ACTIVE_LOANS} pekee kwa wakati mmoja.` : `Max ${MAX_ACTIVE_LOANS} loans at a time.`
                  : res.reason === 'not_unlocked'
                  ? t('not_unlocked', lang)
                  : t('not_enough_cash', lang),
              );
            }
          },
        },
      ],
    );
  };

  const handleRepay = (loanId: string, payoff: number) => {
    Alert.alert(
      lang === 'sw' ? 'Lipa deni lote?' : 'Pay off this loan?',
      lang === 'sw'
        ? `Utalipa ${formatTZS(payoff)} sasa hivi (punguzo la 3%).`
        : `You will pay ${formatTZS(payoff)} now (3% early-payoff discount).`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('yes', lang),
          onPress: () => {
            const res = repayLoan(loanId);
            if (res.ok) {
              buzz(state.settings, 'success');
              toast.success(
                lang === 'sw' ? 'Deni limelipwa! Sifa +1' : 'Loan paid off! Rep +1',
                `−${formatTZS(res.paid ?? payoff)}`,
              );
            } else {
              toast.error(t('not_enough_cash', lang));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backBtn}>← {t('back', lang)}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏦 {lang === 'sw' ? 'Benki' : 'Bank'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card>
          <StatRow label="💵 Cash" value={formatTZS(state.cash)} highlight />
          <StatRow
            label={`⭐ ${t('reputation', lang)}`}
            value={String(state.reputation)}
            highlight={state.reputation > 0}
          />
          <Text style={styles.hint}>
            {lang === 'sw'
              ? 'Sifa nzuri inapunguza riba hadi 40%.'
              : 'Good reputation cuts interest by up to 40%.'}
          </Text>
        </Card>

        {/* Active loans */}
        {state.loans.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>
              {lang === 'sw' ? '📋 Mikopo Inayoendelea' : '📋 Active Loans'}
            </Text>
            {state.loans.map((loan) => {
              const payoff = earlyRepayAmount(loan);
              const canPay = state.cash >= payoff;
              return (
                <Card key={loan.id}>
                  <Text style={styles.offerName}>
                    {lang === 'sw' ? loan.sourceTitle : loan.sourceTitleEn}
                  </Text>
                  <StatRow
                    label={lang === 'sw' ? 'Deni lililobaki' : 'Remaining balance'}
                    value={formatTZS(loan.remainingBalance)}
                    negative
                  />
                  <StatRow
                    label={lang === 'sw' ? 'Malipo ya siku' : 'Daily payment'}
                    value={`−${formatTZS(loan.dailyPayment)}`}
                    negative
                  />
                  <StatRow
                    label={lang === 'sw' ? 'Siku zilizobaki' : 'Days remaining'}
                    value={String(loan.daysRemaining)}
                  />
                  <Button
                    title={
                      canPay
                        ? lang === 'sw'
                          ? `💸 Lipa lote: ${formatTZS(payoff)}`
                          : `💸 Pay off: ${formatTZS(payoff)}`
                        : t('not_enough_cash', lang)
                    }
                    onPress={() => handleRepay(loan.id, payoff)}
                    disabled={!canPay}
                    size="md"
                    fullWidth
                  />
                </Card>
              );
            })}
          </>
        )}

        {/* Offers */}
        <Text style={styles.sectionHeader}>
          {lang === 'sw' ? '💰 Mikopo Inayopatikana' : '💰 Available Loans'}
        </Text>
        {atLoanLimit && (
          <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.warning }}>
            <Text style={styles.hint}>
              {lang === 'sw'
                ? `Umefikia kikomo cha mikopo ${MAX_ACTIVE_LOANS}. Lipa deni kwanza.`
                : `You have reached the ${MAX_ACTIVE_LOANS}-loan limit. Pay one off first.`}
            </Text>
          </Card>
        )}
        {offers.map((offer) => {
          const locked = state.level < offer.unlockLevel;
          const disabled = locked || atLoanLimit;
          return (
            <Card key={offer.id} style={disabled ? { opacity: 0.55 } : undefined}>
              <View style={styles.offerTop}>
                <Text style={styles.offerEmoji}>{offer.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerName}>
                    {lang === 'sw' ? offer.name : offer.nameEn}
                  </Text>
                  <Text style={styles.offerDesc}>
                    {lang === 'sw' ? offer.description : offer.descriptionEn}
                  </Text>
                </View>
              </View>
              <StatRow
                label={lang === 'sw' ? 'Unapokea' : 'You receive'}
                value={`+${formatTZS(offer.principal)}`}
                positive
              />
              <StatRow
                label={lang === 'sw' ? 'Utalipa jumla' : 'Total repayment'}
                value={formatTZS(offer.amountDue)}
                negative
              />
              <StatRow
                label={lang === 'sw' ? 'Malipo ya siku' : 'Daily payment'}
                value={`−${formatTZS(offer.dailyPayment)} × ${offer.termDays} ${lang === 'sw' ? 'siku' : 'days'}`}
                negative
              />
              <View style={styles.pillRow}>
                <Pill
                  label={`${lang === 'sw' ? 'Riba' : 'Interest'}: ${Math.round(offer.interestRate * 100)}%`}
                  bg={colors.warning + '22'}
                  color={colors.warning}
                />
                {locked && (
                  <Pill
                    label={`🔒 ${t('unlock_level', lang)} ${offer.unlockLevel}`}
                    bg={colors.danger + '18'}
                    color={colors.danger}
                  />
                )}
              </View>
              <Button
                title={
                  locked
                    ? `🔒 Level ${offer.unlockLevel}`
                    : lang === 'sw'
                    ? `Chukua ${formatTZS(offer.principal)}`
                    : `Take ${formatTZS(offer.principal)}`
                }
                onPress={() =>
                  handleTake(offer.id, lang === 'sw' ? offer.name : offer.nameEn, offer.principal)
                }
                disabled={disabled}
                size="md"
                fullWidth
              />
            </Card>
          );
        })}

        <Text style={[styles.hint, { textAlign: 'center', paddingBottom: spacing.xl }]}>
          {lang === 'sw'
            ? 'Kumbuka: malipo ya mkopo yanakatwa kila siku kwenye matumizi yako.'
            : 'Remember: loan payments are deducted from your daily expenses.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },
  headerTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  sectionHeader: { fontSize: font.md, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  offerTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  offerEmoji: { fontSize: 32 },
  offerName: { fontSize: font.md, fontWeight: '800', color: colors.text },
  offerDesc: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, lineHeight: 17 },
  pillRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginVertical: spacing.sm },
  hint: { fontSize: font.xs, color: colors.textMuted, marginTop: 6, lineHeight: 17 },
});
