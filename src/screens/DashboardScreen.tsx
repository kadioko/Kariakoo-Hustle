import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import {
  calcDailyExpenses,
  inventoryCapacity,
  inventoryUnits,
  inventoryValue,
  netWorth,
} from '@/game/economy';
import { xpForLevel } from '@/game/progression';
import { findLocation } from '@/data/locations';
import { LOCATIONS } from '@/data/locations';
import { EVENTS } from '@/data/events';
import { PRODUCTS } from '@/data/products';
import { WORKERS } from '@/data/workers';
import { UPGRADES } from '@/data/upgrades';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { StatRow } from '@/components/StatRow';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { businessAdvisorWarnings } from '@/game/advisor';
import { tutorialProgressPercent, tutorialSteps } from '@/game/tutorial';
import { weeklyGoalProgress } from '@/game/weeklyGoals';

// Animated cash number
function AnimatedCash({ value }: { value: number }) {
  const animated = useRef(new Animated.Value(value)).current;
  const displayRef = useRef(value);
  const [display, setDisplay] = React.useState(value);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: value,
      duration: 600,
      useNativeDriver: false,
    }).start();
    const id = animated.addListener(({ value: v }) => {
      const rounded = Math.round(v);
      if (rounded !== displayRef.current) {
        displayRef.current = rounded;
        setDisplay(rounded);
      }
    });
    return () => animated.removeListener(id);
  }, [value]);

  return (
    <Text style={styles.cashAmount}>{formatTZS(display)}</Text>
  );
}

// Business health: 0–100 based on cash vs last expenses + reputation
function healthScore(cash: number, dailyExpenses: number, reputation: number): number {
  const expCushion = dailyExpenses > 0 ? Math.min(1, cash / (dailyExpenses * 7)) : 1;
  const repScore = (reputation + 10) / 110; // normalised 0-1
  return Math.round((expCushion * 0.6 + repScore * 0.4) * 100);
}

function healthColor(score: number): string {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.danger;
}

const QuickButton = ({
  emoji,
  label,
  onPress,
  accent,
  badge,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
  badge?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.quickBtn, accent && styles.quickBtnAccent]}
    activeOpacity={0.72}
  >
    <View style={{ position: 'relative' }}>
      <Text style={styles.quickEmoji}>{emoji}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
    <Text style={[styles.quickLabel, accent && { color: '#fff' }]}>{label}</Text>
  </TouchableOpacity>
);

export const DashboardScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, language, saveStatus, lastSavedAt } = useGame();
  const toast = useToast();
  const lang = language;

  const location = findLocation(state.currentLocationId);
  const expenses = calcDailyExpenses(state);
  const cap = inventoryCapacity(state);
  const used = inventoryUnits(state);
  const invVal = inventoryValue(state);
  const nw = netWorth(state);
  const xpNeeded = xpForLevel(state.level);
  const lastReport = state.reports[0];
  const health = healthScore(state.cash, expenses.total, state.reputation);
  const hColor = healthColor(health);
  const loanBalance = state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const runwayDays = expenses.total > 0 ? Math.floor(state.cash / expenses.total) : 99;

  const pendingEvent = state.pendingEventId
    ? EVENTS.find((e) => e.id === state.pendingEventId)
    : null;
  const nextProduct = [...PRODUCTS]
    .filter((p) => p.unlockLevel > state.level)
    .sort((a, b) => a.unlockLevel - b.unlockLevel || a.buyPrice - b.buyPrice)[0];
  const nextUpgrade = [...UPGRADES]
    .filter((u) => !state.upgrades.includes(u.id))
    .sort((a, b) => a.unlockLevel - b.unlockLevel || a.cost - b.cost)[0];
  const nextWorker = [...WORKERS]
    .filter((w) => !state.workers.includes(w.id))
    .sort((a, b) => a.unlockLevel - b.unlockLevel || a.salary - b.salary)[0];
  const nextLocation = [...LOCATIONS]
    .filter((loc) => !state.locations.includes(loc.id))
    .sort((a, b) => a.unlockCost - b.unlockCost)[0];
  const todayMissions = state.missions.filter((mission) => mission.day === state.day);
  const tutorial = tutorialSteps(state);
  const tutorialPct = tutorialProgressPercent(state);
  const advisorWarnings = businessAdvisorWarnings(state);
  const activeWeeklyGoals = state.weeklyGoals.filter((goal) => state.day >= goal.startDay && state.day <= goal.endDay);
  const savedLabel = saveStatus === 'saving'
    ? (lang === 'sw' ? 'Inahifadhi...' : 'Saving...')
    : saveStatus === 'error'
      ? (lang === 'sw' ? 'Save imekwama' : 'Save failed')
      : lastSavedAt
        ? (lang === 'sw' ? 'Saved' : 'Saved')
        : (lang === 'sw' ? 'Offline ready' : 'Offline ready');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerDay}>
              {t('day', lang)} {state.day} · {location?.emoji} {lang === 'sw' ? location?.name : location?.nameEn}
            </Text>
            <Text style={styles.bannerBiz}>{state.businessName}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNum}>L</Text>
            <Text style={styles.levelVal}>{state.level}</Text>
          </View>
        </View>

        {/* Cash card floating over banner */}
        <View style={styles.cashCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cashLabel}>{t('cash', lang)}</Text>
            <AnimatedCash value={state.cash} />
            <Text style={styles.cashNW}>
              🌐 {t('net_worth', lang)}: {formatTZS(nw)}
            </Text>
          </View>
          <View style={styles.healthWrap}>
            <Text style={styles.healthLabel}>
              {lang === 'sw' ? 'Afya' : 'Health'}
            </Text>
            <View style={[styles.healthRing, { borderColor: hColor }]}>
              <Text style={[styles.healthNum, { color: hColor }]}>{health}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.savePill, saveStatus === 'error' && { borderColor: colors.danger }]}>
            <Text style={[styles.saveText, saveStatus === 'error' && { color: colors.danger }]}>
              {saveStatus === 'error' ? '⚠️' : '✓'} {savedLabel}
            </Text>
          </View>

          {tutorialPct < 100 && (
            <Card alt style={{ borderLeftWidth: 4, borderLeftColor: colors.accent }}>
              <View style={styles.xpRow}>
                <Text style={styles.sectionLabel}>
                  {lang === 'sw' ? 'Dakika 10 za Mwanzo' : 'First 10 Minutes'}
                </Text>
                <Text style={styles.xpVal}>{tutorialPct}%</Text>
              </View>
              <ProgressBar value={tutorialPct} max={100} height={8} color={colors.accent} />
              {tutorial.map((step) => (
                <Pressable
                  key={step.id}
                  onPress={() => {
                    if (!step.completed && step.route) nav.navigate(step.route as any);
                  }}
                  style={styles.tutorialRow}
                >
                  <Text style={styles.tutorialStatus}>{step.completed ? '✅' : '⬜'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tutorialTitle}>{lang === 'sw' ? step.title : step.titleEn}</Text>
                    {!step.completed && (
                      <Text style={styles.tutorialDesc}>{lang === 'sw' ? step.description : step.descriptionEn}</Text>
                    )}
                  </View>
                  {!step.completed && step.route ? <Text style={styles.tutorialArrow}>›</Text> : null}
                </Pressable>
              ))}
            </Card>
          )}

          {advisorWarnings.length > 0 && (
            <Card>
              <Text style={styles.sectionLabel}>
                {lang === 'sw' ? 'Mshauri wa Biashara' : 'Business Advisor'}
              </Text>
              {advisorWarnings.map((warning) => (
                <View key={warning.id} style={styles.advisorRow}>
                  <Text style={styles.missionIcon}>{warning.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.missionTitle}>{lang === 'sw' ? warning.title : warning.titleEn}</Text>
                    <Text style={styles.advisorBody}>{lang === 'sw' ? warning.body : warning.bodyEn}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Pending event banner */}
          {pendingEvent && (
            <Pressable
              style={styles.eventBanner}
              onPress={() => nav.navigate('Sell')}
            >
              <Text style={styles.eventBannerEmoji}>{pendingEvent.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventBannerTitle}>
                  {lang === 'sw' ? pendingEvent.title : pendingEvent.titleEn}
                </Text>
                <Text style={styles.eventBannerSub}>
                  {lang === 'sw' ? 'Gonga hapa kujibu tukio' : 'Tap to respond to this event'}
                </Text>
              </View>
              <Text style={{ color: colors.accent, fontSize: 20 }}>›</Text>
            </Pressable>
          )}

          {/* XP progress */}
          <Card>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>
                ⚡ Level {state.level}
              </Text>
              <Text style={styles.xpVal}>{state.xp} / {xpNeeded} XP</Text>
            </View>
            <ProgressBar value={state.xp} max={xpNeeded} height={10} color={colors.accent} />
          </Card>

          {todayMissions.length > 0 && (
            <Card>
              <Text style={styles.sectionLabel}>
                {lang === 'sw' ? 'Misheni za Leo' : "Today's Missions"}
              </Text>
              {todayMissions.map((mission) => (
                <View key={mission.id} style={styles.missionRow}>
                  <Text style={styles.missionIcon}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.missionTitle}>
                      {lang === 'sw' ? mission.title : mission.titleEn}
                    </Text>
                    <Text style={styles.missionReward}>
                      {[
                        mission.reward.cash ? `+${formatTZS(mission.reward.cash)}` : null,
                        mission.reward.xp ? `+${mission.reward.xp} XP` : null,
                        mission.reward.reputation ? `+${mission.reward.reputation} ${lang === 'sw' ? 'sifa' : 'rep'}` : null,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {activeWeeklyGoals.length > 0 && (
            <Card>
              <Text style={styles.sectionLabel}>
                {lang === 'sw' ? 'Malengo ya Wiki' : 'Weekly Goals'}
              </Text>
              {activeWeeklyGoals.map((goal) => {
                const progress = weeklyGoalProgress(state, goal);
                const complete = state.completedWeeklyGoalIds.includes(goal.id);
                const progressText = goal.metric === 'revenue'
                  ? `${formatTZS(Math.min(progress, goal.target))} / ${formatTZS(goal.target)}`
                  : `${Math.min(progress, goal.target)} / ${goal.target}`;
                return (
                  <View key={goal.id} style={styles.weeklyGoal}>
                    <View style={styles.xpRow}>
                      <Text style={styles.missionTitle}>{complete ? '✅ ' : ''}{lang === 'sw' ? goal.title : goal.titleEn}</Text>
                      <Text style={styles.xpVal}>{progressText}</Text>
                    </View>
                    <ProgressBar value={Math.min(progress, goal.target)} max={goal.target} height={6} color={complete ? colors.success : colors.primary} />
                  </View>
                );
              })}
            </Card>
          )}

          <Card alt>
            <Text style={styles.sectionLabel}>
              {lang === 'sw' ? 'Hatua Zinazofuata' : 'Next Moves'}
            </Text>
            {nextProduct && (
              <StatRow
                label={lang === 'sw' ? 'Bidhaa inayofuata' : 'Next product'}
                value={`${nextProduct.emoji} ${lang === 'sw' ? nextProduct.name : nextProduct.nameEn} · L${nextProduct.unlockLevel}`}
              />
            )}
            {nextUpgrade && (
              <StatRow
                label={lang === 'sw' ? 'Boresho la karibu' : 'Next upgrade'}
                value={`${formatTZS(nextUpgrade.cost)} · ${lang === 'sw' ? nextUpgrade.name : nextUpgrade.nameEn}`}
                negative={state.cash < nextUpgrade.cost}
                highlight={state.cash >= nextUpgrade.cost && state.level >= nextUpgrade.unlockLevel}
              />
            )}
            {nextWorker && (
              <StatRow
                label={lang === 'sw' ? 'Mfanyakazi anayefuata' : 'Next worker'}
                value={`${lang === 'sw' ? nextWorker.name : nextWorker.nameEn} · L${nextWorker.unlockLevel}`}
              />
            )}
            {nextLocation && (
              <StatRow
                label={lang === 'sw' ? 'Eneo la kufungua' : 'Next location'}
                value={`${formatTZS(nextLocation.unlockCost)} · ${lang === 'sw' ? nextLocation.name : nextLocation.nameEn}`}
                negative={state.cash < nextLocation.unlockCost}
              />
            )}
          </Card>

          {/* Key stats */}
          <Card>
            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellVal}>{formatTZS(invVal)}</Text>
                <Text style={styles.statCellLabel}>{t('inventory_value', lang)}</Text>
              </View>
              <View style={[styles.statCell, styles.statCellBorder]}>
                <Text style={[styles.statCellVal, { color: state.reputation >= 0 ? colors.success : colors.danger }]}>
                  {state.reputation >= 0 ? '+' : ''}{state.reputation}
                </Text>
                <Text style={styles.statCellLabel}>⭐ {t('reputation', lang)}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={[styles.statCellVal, { color: used >= cap ? colors.danger : colors.text }]}>
                  {used}/{cap}
                </Text>
                <Text style={styles.statCellLabel}>📦 {t('capacity', lang)}</Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.sm }}>
              <ProgressBar
                value={used}
                max={cap}
                height={6}
                color={used >= cap ? colors.danger : colors.primaryLight}
              />
            </View>
          </Card>

          {/* Business health bar */}
          <Card>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>
                {lang === 'sw' ? '❤️ Afya ya Biashara' : '❤️ Business Health'}
              </Text>
              <Text style={[styles.xpVal, { color: hColor }]}>{health}%</Text>
            </View>
            <ProgressBar value={health} max={100} height={10} color={hColor} />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <StatRow
                label={`🏠 ${t('rent_due', lang)}`}
                value={formatTZS(expenses.rent)}
                negative
                style={{ flex: 1 }}
              />
              <StatRow
                label={`👥 ${t('workers', lang)}`}
                value={`${state.workers.length}`}
                style={{ flex: 1 }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
              <StatRow
                label={lang === 'sw' ? '💸 Runway' : '💸 Runway'}
                value={runwayDays >= 99 ? '99+' : `${runwayDays} ${lang === 'sw' ? 'siku' : 'days'}`}
                negative={runwayDays < 3}
                highlight={runwayDays >= 7}
                style={{ flex: 1 }}
              />
              <StatRow
                label={lang === 'sw' ? '🏦 Madeni' : '🏦 Loans'}
                value={formatTZS(loanBalance)}
                negative={loanBalance > 0}
                style={{ flex: 1 }}
              />
            </View>
          </Card>

          {/* Last day profit */}
          {lastReport && (
            <Card alt>
              <Text style={styles.sectionLabel}>
                {lang === 'sw' ? `📊 ${t('day', lang)} ${lastReport.day} — Matokeo` : `📊 Day ${lastReport.day} Results`}
              </Text>
              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={[styles.statCellVal, { color: colors.info, fontSize: font.md }]}>
                    {formatTZS(lastReport.revenue)}
                  </Text>
                  <Text style={styles.statCellLabel}>{t('revenue', lang)}</Text>
                </View>
                <View style={[styles.statCell, styles.statCellBorder]}>
                  <Text style={[styles.statCellVal, { color: lastReport.netProfit >= 0 ? colors.success : colors.danger, fontSize: font.md }]}>
                    {lastReport.netProfit >= 0 ? '+' : ''}{formatTZS(lastReport.netProfit)}
                  </Text>
                  <Text style={styles.statCellLabel}>{t('net_profit', lang)}</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={[styles.statCellVal, { fontSize: font.md }]}>
                    {lastReport.unitsSold}
                  </Text>
                  <Text style={styles.statCellLabel}>{t('units_sold', lang)}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Quick actions */}
          <Text style={styles.sectionLabel}>
            {lang === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
          </Text>
          <View style={styles.quickGrid}>
            <QuickButton
              emoji="🛍️"
              label={t('buy_stock', lang)}
              onPress={() => nav.navigate('Market' as any)}
            />
            <QuickButton
              emoji="📦"
              label={t('inventory', lang)}
              onPress={() => nav.navigate('Inventory' as any)}
              badge={used > 0 ? String(used) : undefined}
            />
            <QuickButton
              emoji="🛠️"
              label={t('upgrades', lang)}
              onPress={() => nav.navigate('Upgrades' as any)}
            />
            <QuickButton
              emoji="👔"
              label={t('hire_workers', lang)}
              onPress={() => nav.navigate('Workers')}
              badge={state.workers.length > 0 ? String(state.workers.length) : undefined}
            />
            <QuickButton
              emoji="📍"
              label={t('locations', lang)}
              onPress={() => nav.navigate('Locations')}
              badge={state.locations.length > 1 ? String(state.locations.length) : undefined}
            />
            <QuickButton
              emoji="📊"
              label={t('reports', lang)}
              onPress={() => nav.navigate('Reports')}
            />
            <QuickButton
              emoji="🏆"
              label={t('achievements', lang)}
              onPress={() => nav.navigate('Achievements')}
              badge={state.achievements.length > 0 ? String(state.achievements.length) : undefined}
            />
          </View>

          {/* Sell CTA */}
          <Button
            title={`🤑 ${t('sell_today', lang)} — ${t('day', lang)} ${state.day}`}
            onPress={() => nav.navigate('Sell')}
            size="lg"
            variant="accent"
            fullWidth
            style={styles.sellBtn}
          />

          {used === 0 && (
            <Text style={styles.noStockHint}>
              {lang === 'sw'
                ? '⚠️ Huna mzigo! Nenda sokoni kwanza.'
                : '⚠️ No stock! Visit the market first.'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bannerDay: { color: '#FFFFFFBB', fontSize: font.xs, fontWeight: '600', marginBottom: 4 },
  bannerBiz: { color: '#fff', fontSize: font.xl, fontWeight: '900', lineHeight: 26 },
  levelBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  levelNum: { color: '#1F2421', fontSize: font.xs, fontWeight: '800' },
  levelVal: { color: '#1F2421', fontSize: font.xl, fontWeight: '900' },
  cashCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: -28,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.pop,
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '700', letterSpacing: 0.5 },
  cashAmount: { color: colors.primaryDark, fontSize: 30, fontWeight: '900', marginTop: 2 },
  cashNW: { color: colors.textMuted, fontSize: font.xs, marginTop: 4 },
  healthWrap: { alignItems: 'center', gap: 4 },
  healthLabel: { color: colors.textMuted, fontSize: font.xs, fontWeight: '600' },
  healthRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthNum: { fontSize: font.sm, fontWeight: '900' },
  body: { padding: spacing.lg, gap: spacing.md },
  savePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  saveText: { color: colors.textMuted, fontSize: font.xs, fontWeight: '800' },
  tutorialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  tutorialStatus: { fontSize: 17 },
  tutorialTitle: { color: colors.text, fontSize: font.sm, fontWeight: '900' },
  tutorialDesc: { color: colors.textMuted, fontSize: font.xs, lineHeight: 17, marginTop: 2 },
  tutorialArrow: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  advisorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    alignItems: 'flex-start',
  },
  advisorBody: { color: colors.textMuted, fontSize: font.xs, lineHeight: 17, marginTop: 2 },
  weeklyGoal: { paddingTop: spacing.sm, gap: 4 },
  eventBanner: {
    backgroundColor: colors.accent + '22',
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventBannerEmoji: { fontSize: 28 },
  eventBannerTitle: { fontSize: font.sm, fontWeight: '800', color: colors.text },
  eventBannerSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  missionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    alignItems: 'flex-start',
  },
  missionIcon: { fontSize: 18 },
  missionTitle: { fontSize: font.sm, fontWeight: '800', color: colors.text },
  missionReward: { fontSize: font.xs, color: colors.success, marginTop: 2, fontWeight: '700' },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLabel: { fontSize: font.sm, fontWeight: '800', color: colors.text },
  xpVal: { fontSize: font.xs, color: colors.textMuted },
  statGrid: { flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  statCellBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statCellVal: { fontSize: font.lg, fontWeight: '900', color: colors.text },
  statCellLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    ...shadow.card,
    gap: 4,
  },
  quickBtnAccent: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: font.xs, fontWeight: '700', color: colors.text, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  sellBtn: { marginTop: spacing.sm },
  noStockHint: {
    color: colors.warning,
    fontSize: font.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
});
