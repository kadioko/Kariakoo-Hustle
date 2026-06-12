import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { findProduct } from '@/data/products';
import { DailyReport, EventChoice, GameEvent } from '@/types';
import { inventoryUnits, calcDailyExpenses } from '@/game/economy';
import { ACHIEVEMENTS } from '@/data/achievements';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { ProgressBar } from '@/components/ProgressBar';
import { Pill } from '@/components/Pill';
import { buzz } from '@/utils/haptics';
import { streakEmoji } from '@/game/streaks';

type Phase = 'idle' | 'selling' | 'event' | 'result';

function SellingAnimation({ onDone }: { onDone: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  const bounceY = useRef(new Animated.Value(0)).current;

  const STEPS = [
    '🛒 Mzigo unawekwa...',
    '💬 Wateja wanakuja...',
    '💵 Mauzo yanafanyika...',
    '📊 Hesabu inafanywa...',
    '✅ Siku imekwisha!',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const duration = 2200;
    Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();

    progress.addListener(({ value }) => setPct(Math.round(value * 100)));

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ).start();

    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(STEPS.length - 1, s + 1));
    }, duration / STEPS.length);

    const done = setTimeout(onDone, duration + 200);
    return () => {
      clearInterval(stepInterval);
      clearTimeout(done);
      progress.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.sellingWrap}>
      <Animated.Text style={[styles.sellingEmoji, { transform: [{ translateY: bounceY }] }]}>
        🏪
      </Animated.Text>
      <Text style={styles.sellingStep}>{STEPS[step]}</Text>
      <View style={styles.sellingBarWrap}>
        <ProgressBar value={pct} max={100} height={14} color={colors.accent} />
        <Text style={styles.sellingPct}>{pct}%</Text>
      </View>
    </View>
  );
}

// Result hero juice: spring-pop on profit, shake on loss
function HeroPop({ profitable, children }: { profitable: boolean; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
    if (!profitable) {
      Animated.sequence([
        Animated.delay(250),
        Animated.timing(shake, { toValue: 9, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -9, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -4, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scale }, { translateX: shake }] }}>
      {children}
    </Animated.View>
  );
}

export const SellScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, endDay, applyChoice, dismissEvent } = useGame();
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>('idle');
  const [report, setReport] = useState<DailyReport | null>(null);
  const [pendingEvent, setPendingEvent] = useState<GameEvent | null>(null);
  const [eventResult, setEventResult] = useState<{ sw: string; en: string } | null>(null);
  const lang = language;

  const totalStock = inventoryUnits(state);
  const expenses = calcDailyExpenses(state);

  const runDay = () => {
    setPhase('selling');
  };

  const onSellingDone = () => {
    const outcome = endDay();
    setReport(outcome.report);

    buzz(state.settings, outcome.report.netProfit >= 0 ? 'success' : 'error');
    if (outcome.newlyUnlockedAchievements.length > 0 || outcome.levelsGained > 0) {
      buzz(state.settings, 'achievement');
    }

    if (outcome.completedStoryChapter) {
      const ch = outcome.completedStoryChapter;
      toast.achievement(
        lang === 'sw' ? `📖 Sura imekamilika: ${ch.title}` : `📖 Chapter complete: ${ch.titleEn}`,
        lang === 'sw'
          ? `${ch.character} anajivunia wewe.`
          : `${ch.characterEn} is proud of you.`,
      );
    }

    if (outcome.levelsGained > 0) {
      const newLevel = state.level + outcome.levelsGained;
      toast.achievement(
        lang === 'sw' ? `🎉 Level ${newLevel}!` : `🎉 Level ${newLevel}!`,
        lang === 'sw'
          ? 'Biashara yako imekua. Bidhaa na maboresho mapya yanaweza kufunguka.'
          : 'Your business grew. New products and upgrades may have unlocked.',
      );
    }

    // Toast achievements
    outcome.newlyUnlockedAchievements.forEach((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) {
        toast.achievement(
          lang === 'sw' ? a.title : a.titleEn,
          lang === 'sw' ? a.description : a.descriptionEn,
        );
      }
    });
    outcome.completedWeeklyGoals.forEach((goal) => {
      toast.success(
        lang === 'sw' ? `Lengo la wiki: ${goal.title}` : `Weekly goal: ${goal.titleEn}`,
        lang === 'sw' ? goal.rewardText : goal.rewardTextEn,
      );
    });

    if (outcome.pendingEvent) {
      setPendingEvent(outcome.pendingEvent);
      setPhase('event');
    } else {
      setPhase('result');
    }
  };

  const handleChoice = (event: GameEvent, choice: EventChoice) => {
    const res = applyChoice(event.id, choice.id);
    setEventResult({ sw: res.effectText, en: res.effectTextEn });
    setPhase('result');
  };

  const handleDone = () => {
    dismissEvent();
    setPendingEvent(null);
    setEventResult(null);
    setPhase('idle');
    nav.goBack();
  };

  // — EVENT CHOICE SCREEN —
  if (phase === 'event' && pendingEvent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚡ {t('event_title', lang)}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <Card style={{ alignItems: 'center', padding: spacing.xl }}>
            <Text style={styles.eventEmoji}>{pendingEvent.emoji}</Text>
            <Text style={styles.eventTitle}>
              {lang === 'sw' ? pendingEvent.title : pendingEvent.titleEn}
            </Text>
            <Text style={styles.eventDesc}>
              {lang === 'sw' ? pendingEvent.description : pendingEvent.descriptionEn}
            </Text>
          </Card>

          <Text style={styles.whatDo}>{t('what_do_you_do', lang)}</Text>

          {pendingEvent.choices?.map((choice) => (
            <TouchableOpacity
              key={choice.id}
              style={styles.choiceCard}
              onPress={() => handleChoice(pendingEvent, choice)}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceLabel}>
                {lang === 'sw' ? choice.label : choice.labelEn}
              </Text>
              <Text style={styles.choiceHint}>
                {lang === 'sw' ? choice.effectText : choice.effectTextEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — RESULT SCREEN —
  if (phase === 'result' && report) {
    const profitable = report.netProfit >= 0;
    const best = report.bestSellerId ? findProduct(report.bestSellerId) : null;
    const worst = report.worstSellerId ? findProduct(report.worstSellerId) : null;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero header */}
          <View style={[styles.reportHero, { backgroundColor: profitable ? colors.primary : colors.danger }]}>
            <Text style={styles.reportHeroDay}>{t('day', lang)} {report.day}</Text>
            <HeroPop profitable={profitable}>
              <Text style={styles.reportHeroEmoji}>{profitable ? '🤑' : '😓'}</Text>
              <Text style={styles.reportHeroNet}>{profitable ? '+' : ''}{formatTZS(report.netProfit)}</Text>
              <Text style={styles.reportHeroLabel}>{t('net_profit', lang)}</Text>
            </HeroPop>
            <View style={styles.reportQuickRow}>
              <View style={styles.reportQuickItem}>
                <Text style={styles.reportQuickVal}>{formatTZS(report.revenue)}</Text>
                <Text style={styles.reportQuickLabel}>{t('revenue', lang)}</Text>
              </View>
              <View style={styles.reportQuickItem}>
                <Text style={styles.reportQuickVal}>{report.unitsSold}</Text>
                <Text style={styles.reportQuickLabel}>{t('units_sold', lang)}</Text>
              </View>
              <View style={styles.reportQuickItem}>
                <Text style={[styles.reportQuickVal, { color: '#FFD700' }]}>
                  {report.reputationChange >= 0 ? '+' : ''}{report.reputationChange}
                </Text>
                <Text style={styles.reportQuickLabel}>⭐ {t('reputation', lang)}</Text>
              </View>
            </View>
          </View>

          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            {(report.streak ?? 0) >= 2 && (
              <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.accent }}>
                <Text style={styles.sectionTitle}>
                  {streakEmoji(report.streak ?? 0)}{' '}
                  {lang === 'sw'
                    ? `Mfululizo wa siku ${report.streak} za faida!`
                    : `${report.streak}-day profit streak!`}
                </Text>
                {(report.streakBonus ?? 0) > 0 && (
                  <Text style={{ color: colors.textMuted, fontSize: font.sm, lineHeight: 20 }}>
                    {lang === 'sw'
                      ? `Bonasi ya mfululizo: +${formatTZS(report.streakBonus ?? 0)}`
                      : `Streak bonus: +${formatTZS(report.streakBonus ?? 0)}`}
                  </Text>
                )}
              </Card>
            )}
            {report.unitsSold >= 10 && (
              <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.accent }}>
                <Text style={styles.sectionTitle}>
                  {lang === 'sw' ? '🎉 Wateja wamefurika!' : '🎉 Customers showed up!'}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: font.sm, lineHeight: 20 }}>
                  {lang === 'sw'
                    ? `Umeuza vipande ${report.unitsSold}. Hii ni siku nzuri ya kuzungusha mzigo.`
                    : `You sold ${report.unitsSold} units. That is a strong stock-turning day.`}
                </Text>
              </Card>
            )}

            {/* P&L breakdown */}
            <Card>
              <Text style={styles.sectionTitle}>
                {lang === 'sw' ? '📊 Hesabu ya Siku' : '📊 Day P&L'}
              </Text>
              <StatRow label={t('revenue', lang)} value={formatTZS(report.revenue)} highlight />
              <StatRow label={t('cogs', lang)} value={`−${formatTZS(report.cogs)}`} negative />
              {(report.qualityLoss ?? 0) > 0 && (
                <StatRow
                  label={lang === 'sw' ? 'Hasara ya Quality' : 'Quality Loss'}
                  value={`−${formatTZS(report.qualityLoss ?? 0)}`}
                  negative
                />
              )}
              <View style={styles.divider} />
              <StatRow label={t('gross_profit', lang)} value={formatTZS(report.grossProfit)} positive={report.grossProfit >= 0} negative={report.grossProfit < 0} />
              <StatRow label={t('expenses', lang)} value={`−${formatTZS(report.expenses)}`} negative />
              {(report.propertyIncome ?? 0) > 0 && (
                <StatRow
                  label={lang === 'sw' ? '🏠 Kipato cha Mali' : '🏠 Property Income'}
                  value={`+${formatTZS(report.propertyIncome ?? 0)}`}
                  positive
                />
              )}
              <View style={styles.divider} />
              <StatRow
                label={t('net_profit', lang)}
                value={`${profitable ? '+' : ''}${formatTZS(report.netProfit)}`}
                positive={profitable}
                negative={!profitable}
              />
            </Card>

            {/* Stock summary */}
            <Card>
              <Text style={styles.sectionTitle}>
                {lang === 'sw' ? '📦 Mzigo' : '📦 Stock'}
              </Text>
              <StatRow label={t('units_sold', lang)} value={String(report.unitsSold)} positive />
              {(report.returnedUnits ?? 0) > 0 && (
                <StatRow
                  label={lang === 'sw' ? 'Zimerudishwa' : 'Returned/Faulty'}
                  value={String(report.returnedUnits)}
                  negative
                />
              )}
              <StatRow label={t('units_remaining', lang)} value={String(report.unitsRemaining)} />
              {best && (
                <StatRow
                  label={`🔥 ${t('best_seller', lang)}`}
                  value={`${best.emoji} ${lang === 'sw' ? best.name : best.nameEn}`}
                />
              )}
              {worst && report.worstSellerId !== report.bestSellerId && (
                <StatRow
                  label={`🐌 ${t('worst_seller', lang)}`}
                  value={`${worst.emoji} ${lang === 'sw' ? worst.name : worst.nameEn}`}
                />
              )}
            </Card>

            {report.salesBreakdown && report.salesBreakdown.length > 0 && (
              <Card>
                <Text style={styles.sectionTitle}>
                  {lang === 'sw' ? '🧾 Bidhaa zilizouzwa' : '🧾 Product-by-product sales'}
                </Text>
                {report.salesBreakdown.slice(0, 6).map((sale) => {
                  const product = findProduct(sale.productId);
                  if (!product) return null;
                  return (
                    <View key={sale.productId} style={styles.saleTickerRow}>
                      <Text style={styles.saleTickerEmoji}>{product.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.saleTickerName}>{lang === 'sw' ? product.name : product.nameEn}</Text>
                        <Text style={styles.saleTickerSub}>
                          {sale.sold} {lang === 'sw' ? 'vipande' : 'units'} · {formatTZS(sale.revenue)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Card>
            )}

            {(report.whatWentWell || report.whatHurt || report.adviceTomorrow) && (
              <Card alt>
                <Text style={styles.sectionTitle}>
                  {lang === 'sw' ? '🧠 Somo la Biashara' : '🧠 Business Lesson'}
                </Text>
                {report.trendProfit !== undefined && (
                  <StatRow
                    label={lang === 'sw' ? 'Trend vs jana' : 'Trend vs yesterday'}
                    value={`${report.trendProfit >= 0 ? '+' : ''}${formatTZS(report.trendProfit)}`}
                    positive={report.trendProfit >= 0}
                    negative={report.trendProfit < 0}
                  />
                )}
                {report.whatWentWell && (
                  <Text style={styles.lessonText}>✅ {lang === 'sw' ? report.whatWentWell : report.whatWentWellEn}</Text>
                )}
                {report.whatHurt && (
                  <Text style={styles.lessonText}>⚠️ {lang === 'sw' ? report.whatHurt : report.whatHurtEn}</Text>
                )}
                {report.workerNote && (
                  <Text style={styles.lessonText}>👥 {lang === 'sw' ? report.workerNote : report.workerNoteEn}</Text>
                )}
                {report.adviceTomorrow && (
                  <Text style={styles.lessonText}>💡 {lang === 'sw' ? report.adviceTomorrow : report.adviceTomorrowEn}</Text>
                )}
              </Card>
            )}

            {report.missionResults && report.missionResults.length > 0 && (
              <Card>
                <Text style={styles.sectionTitle}>
                  {lang === 'sw' ? '🎯 Misheni za Leo' : "🎯 Today's Missions"}
                </Text>
                {report.missionResults.map((mission) => (
                  <View key={mission.id} style={styles.missionResultRow}>
                    <Text style={styles.missionResultStatus}>
                      {mission.completed ? '✅' : '⬜'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.missionResultTitle}>
                        {lang === 'sw' ? mission.title : mission.titleEn}
                      </Text>
                      <Text style={styles.missionResultSub}>
                        {Math.min(mission.progress, mission.target)} / {mission.target}
                        {mission.completed
                          ? ` · ${lang === 'sw' ? mission.rewardText : mission.rewardTextEn}`
                          : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {/* Event effect */}
            {(report.eventTitle || eventResult) && (
              <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.warning }}>
                <Text style={styles.sectionTitle}>⚡ {lang === 'sw' ? 'Tukio la Siku' : 'Day Event'}</Text>
                {report.eventTitle && (
                  <Text style={{ fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    {lang === 'sw' ? report.eventTitle : report.eventTitleEn ?? report.eventTitle}
                  </Text>
                )}
                <Text style={{ fontSize: font.sm, color: colors.textMuted }}>
                  {eventResult
                    ? (lang === 'sw' ? eventResult.sw : eventResult.en)
                    : lang === 'sw'
                    ? report.eventEffectText
                    : report.eventEffectTextEn ?? report.eventEffectText}
                </Text>
              </Card>
            )}

            {/* Advice */}
            <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
              <Text style={styles.sectionTitle}>💡 {t('advice', lang)}</Text>
              <Text style={{ fontSize: font.sm, color: colors.textMuted, lineHeight: 20 }}>
                {lang === 'sw' ? report.advice : report.adviceEn}
              </Text>
            </Card>

            <Button
              title={`✅ ${t('continue', lang)}`}
              onPress={handleDone}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — SELLING ANIMATION —
  if (phase === 'selling') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
        <SellingAnimation onDone={onSellingDone} />
      </SafeAreaView>
    );
  }

  // — IDLE: sell prompt —
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backBtn}>← {t('back', lang)}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('sell_title', lang)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card style={{ alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ fontSize: 72 }}>🏪</Text>
          <Text style={styles.dayLabel}>{t('day', lang)} {state.day}</Text>
          <Text style={styles.sellIntro}>{t('sell_intro', lang)}</Text>
        </Card>

        {/* Today's expected costs */}
        <Card>
          <Text style={styles.sectionTitle}>
            {lang === 'sw' ? '💸 Matumizi ya Leo' : "💸 Today's Expenses"}
          </Text>
          <StatRow label={`🏠 ${t('rent_due', lang)}`} value={formatTZS(expenses.rent)} negative />
          <StatRow label="🚛 Transport" value={formatTZS(expenses.transport)} negative />
          {expenses.workerSalary > 0 && (
            <StatRow label={`👥 ${t('salary', lang)}`} value={formatTZS(expenses.workerSalary)} negative />
          )}
          {expenses.loanPayment > 0 && (
            <StatRow
              label={lang === 'sw' ? '🏦 Malipo ya Mkopo' : '🏦 Loan Payment'}
              value={formatTZS(expenses.loanPayment)}
              negative
            />
          )}
          <View style={styles.divider} />
          <StatRow label={lang === 'sw' ? 'Jumla' : 'Total'} value={formatTZS(expenses.total)} negative />
        </Card>

        {state.loans.length > 0 && (
          <Card alt>
            <Text style={styles.sectionTitle}>
              {lang === 'sw' ? '🏦 Madeni Yanayoendelea' : '🏦 Active Loans'}
            </Text>
            {state.loans.map((loan) => (
              <StatRow
                key={loan.id}
                label={lang === 'sw' ? loan.sourceTitle : loan.sourceTitleEn}
                value={`${formatTZS(loan.remainingBalance)} · ${loan.daysRemaining} ${lang === 'sw' ? 'siku' : 'days'}`}
                negative
              />
            ))}
          </Card>
        )}

        <Card>
          <StatRow label="💵 Cash" value={formatTZS(state.cash)} highlight />
          <StatRow label={`📦 ${lang === 'sw' ? 'Mzigo wa Kuuza' : 'Stock to Sell'}`} value={`${totalStock} units`} />
          <StatRow label={`📍 ${lang === 'sw' ? 'Eneo' : 'Location'}`} value={state.currentLocationId.replace(/_/g, ' ')} />
          <StatRow label={`⭐ ${t('reputation', lang)}`} value={String(state.reputation)} highlight={state.reputation > 0} negative={state.reputation < 0} />
        </Card>

        <Button
          title={`🛒 ${t('start_selling', lang)}`}
          onPress={runDay}
          size="lg"
          variant="accent"
          fullWidth
          disabled={totalStock === 0}
        />
        {totalStock === 0 && (
          <Text style={{ textAlign: 'center', color: colors.textMuted, fontSize: font.sm }}>
            {t('no_stock', lang)}
          </Text>
        )}
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
  dayLabel: { fontSize: font.xxl, fontWeight: '900', color: colors.primary, marginTop: spacing.md },
  sellIntro: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  sectionTitle: { fontSize: font.sm, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  // Selling animation
  sellingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  sellingEmoji: { fontSize: 80 },
  sellingStep: { color: '#fff', fontSize: font.lg, fontWeight: '700', textAlign: 'center' },
  sellingBarWrap: { width: '100%', gap: spacing.sm },
  sellingPct: { color: '#FFFFFFCC', fontSize: font.sm, fontWeight: '700', textAlign: 'center' },
  // Event
  eventEmoji: { fontSize: 64, marginBottom: spacing.md },
  eventTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  eventDesc: { color: colors.textMuted, fontSize: font.md, textAlign: 'center', lineHeight: 22 },
  whatDo: { fontSize: font.md, fontWeight: '700', color: colors.text, textAlign: 'center' },
  choiceCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  choiceLabel: { fontSize: font.md, fontWeight: '800', color: colors.primary },
  choiceHint: { fontSize: font.sm, color: colors.textMuted },
  // Report hero
  reportHero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  reportHeroDay: { color: '#FFFFFFCC', fontSize: font.xs },
  reportHeroEmoji: { fontSize: 56, marginVertical: spacing.sm },
  reportHeroNet: { color: '#fff', fontSize: 36, fontWeight: '900' },
  reportHeroLabel: { color: '#FFFFFFCC', fontSize: font.sm },
  reportQuickRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: '#FFFFFF18',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  reportQuickItem: { alignItems: 'center', flex: 1 },
  reportQuickVal: { color: '#fff', fontSize: font.lg, fontWeight: '900' },
  reportQuickLabel: { color: '#FFFFFFCC', fontSize: font.xs, marginTop: 2 },
  missionResultRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  missionResultStatus: { fontSize: 18 },
  missionResultTitle: { fontSize: font.sm, fontWeight: '800', color: colors.text },
  missionResultSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  saleTickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  saleTickerEmoji: { fontSize: 22 },
  saleTickerName: { color: colors.text, fontSize: font.sm, fontWeight: '800' },
  saleTickerSub: { color: colors.textMuted, fontSize: font.xs, marginTop: 2 },
  lessonText: { color: colors.textMuted, fontSize: font.sm, lineHeight: 20, marginTop: 5 },
});
