import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { LOCATIONS } from '@/data/locations';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Pill } from '@/components/Pill';
import { Header } from '@/components/Header';

export const LocationsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, unlockLocation, switchLocation } = useGame();
  const toast = useToast();
  const lang = language;

  const handleUnlock = (id: string, name: string) => {
    const res = unlockLocation(id);
    if (res.ok) {
      toast.success(lang === 'sw' ? `${name} limefunguliwa!` : `${name} unlocked!`);
      return;
    }

    const msg =
      res.reason === 'not_enough_cash'
        ? t('not_enough_cash', lang)
        : res.reason === 'already_unlocked'
          ? lang === 'sw' ? 'Tayari limefunguliwa' : 'Already unlocked'
          : res.reason ?? t('not_unlocked', lang);
    toast.error(msg);
  };

  const handleSwitch = (id: string, name: string) => {
    switchLocation(id);
    toast.success(lang === 'sw' ? `Umehamia ${name}.` : `Moved to ${name}.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`📍 ${t('locations', lang)}`} subtitle={`${state.locations.length} ${lang === 'sw' ? 'yamefunguliwa' : 'unlocked'}`} />
      <Button title={`← ${t('back', lang)}`} onPress={() => nav.goBack()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {LOCATIONS.map((loc) => {
          const owned = state.locations.includes(loc.id);
          const isCurrent = state.currentLocationId === loc.id;
          const canAfford = state.cash >= loc.unlockCost;
          const name = lang === 'en' ? loc.nameEn : loc.name;
          const desc = lang === 'en' ? loc.descriptionEn : loc.description;
          const flavor = lang === 'en' ? loc.flavorEn : loc.flavor;
          const boosts = Object.entries(loc.categoryBoosts ?? {});

          return (
            <Card key={loc.id} style={[isCurrent && styles.currentCard]}>
              <View style={styles.top}>
                <Text style={styles.emoji}>{loc.emoji}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name}>{name}</Text>
                    {isCurrent && <Pill label={t('current', lang)} bg={colors.primary} color="#fff" />}
                    {owned && !isCurrent && <Pill label={t('unlocked', lang)} bg={colors.success + '22'} color={colors.success} />}
                  </View>
                  <Text style={styles.desc}>{desc}</Text>
                  <Text style={styles.flavor}>{flavor}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <StatRow label={t('daily_rent', lang)} value={formatTZS(loc.dailyRent)} negative />
              <StatRow label={t('demand_boost', lang)} value={`x${loc.demandMultiplier}`} positive />
              <StatRow label={`+${t('capacity', lang)}`} value={`+${loc.capacityBonus}`} />
              <StatRow
                label={t('risk', lang)}
                value={t(`risk_${loc.risk}`, lang)}
              />
              {boosts.length > 0 && (
                <Text style={styles.boostText}>
                  {lang === 'sw' ? 'Boost' : 'Boost'}:{' '}
                  {boosts.map(([category, boost]) => `${t(`category_${category}`, lang)} +${Math.round(Number(boost) * 100)}%`).join(' · ')}
                </Text>
              )}

              {!owned && (
                <Button
                  title={
                    !canAfford
                      ? `${t('not_enough_cash', lang)} (${formatTZS(loc.unlockCost)})`
                      : `${t('unlock', lang)} - ${formatTZS(loc.unlockCost)}`
                  }
                  disabled={!canAfford}
                  onPress={() => handleUnlock(loc.id, name)}
                  variant={!canAfford ? 'secondary' : 'accent'}
                  size="sm"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              )}

              {owned && !isCurrent && (
                <Button
                  title={t('switch_location', lang)}
                  onPress={() => handleSwitch(loc.id, name)}
                  variant="outline"
                  size="sm"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  currentCard: { borderColor: colors.primary, borderWidth: 2 },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  emoji: { fontSize: 36 },
  name: { flexShrink: 1, fontSize: font.md, fontWeight: '800', color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  flavor: { fontSize: font.xs, color: colors.primary, marginTop: 5, lineHeight: 17, fontWeight: '700' },
  boostText: { color: colors.textMuted, fontSize: font.xs, lineHeight: 18, marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
