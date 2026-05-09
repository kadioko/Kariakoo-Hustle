import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { LOCATIONS } from '@/data/locations';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Pill } from '@/components/Pill';
import { Header } from '@/components/Header';

const riskColor = { low: colors.success, medium: colors.warning, high: colors.danger };

export const LocationsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, unlockLocation, switchLocation } = useGame();
  const lang = language;

  const handleUnlock = (id: string, name: string, cost: number) => {
    Alert.alert(
      lang === 'sw' ? `Fungua ${name}?` : `Open ${name}?`,
      `${formatTZS(cost)}`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('unlock', lang),
          onPress: () => {
            const res = unlockLocation(id);
            if (!res.ok) {
              Alert.alert('', res.reason === 'not_enough_cash' ? t('not_enough_cash', lang) : res.reason ?? '');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`📍 ${t('locations', lang)}`} subtitle={`${state.locations.length} ${lang === 'sw' ? 'yimefunguliwa' : 'unlocked'}`} />
      <Button title={`← ${t('back', lang)}`} onPress={() => nav.goBack()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {LOCATIONS.map((loc) => {
          const owned = state.locations.includes(loc.id);
          const isCurrent = state.currentLocationId === loc.id;
          const canAfford = state.cash >= loc.unlockCost;
          const name = lang === 'en' ? loc.nameEn : loc.name;
          const desc = lang === 'en' ? loc.descriptionEn : loc.description;

          return (
            <Card key={loc.id} style={[isCurrent && styles.currentCard]}>
              <View style={styles.top}>
                <Text style={styles.emoji}>{loc.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.name}>{name}</Text>
                    {isCurrent && <Pill label={t('current', lang)} bg={colors.primary} color="#fff" />}
                    {owned && !isCurrent && <Pill label={t('unlocked', lang)} bg={colors.success + '22'} color={colors.success} />}
                  </View>
                  <Text style={styles.desc}>{desc}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <StatRow label={t('daily_rent', lang)} value={formatTZS(loc.dailyRent)} negative />
              <StatRow label={t('demand_boost', lang)} value={`×${loc.demandMultiplier}`} positive />
              <StatRow label={`+${t('capacity', lang)}`} value={`+${loc.capacityBonus}`} />
              <StatRow
                label={t('risk', lang)}
                value={t(`risk_${loc.risk}`, lang)}
              />

              {!owned && (
                <Button
                  title={
                    !canAfford
                      ? `${t('not_enough_cash', lang)} (${formatTZS(loc.unlockCost)})`
                      : `${t('unlock', lang)} — ${formatTZS(loc.unlockCost)}`
                  }
                  disabled={!canAfford}
                  onPress={() => handleUnlock(loc.id, name, loc.unlockCost)}
                  variant={!canAfford ? 'secondary' : 'accent'}
                  size="sm"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              )}

              {owned && !isCurrent && (
                <Button
                  title={t('switch_location', lang)}
                  onPress={() => switchLocation(loc.id)}
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
  emoji: { fontSize: 36 },
  name: { fontSize: font.md, fontWeight: '800', color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
