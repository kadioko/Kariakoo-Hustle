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
import { PROPERTIES, propertyDailyIncome } from '@/game/property';

export const PropertyScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, buyProperty } = useGame();
  const toast = useToast();
  const lang = language;
  const dailyIncome = propertyDailyIncome(state);

  const handleBuy = (id: string, name: string, cost: number) => {
    Alert.alert(
      lang === 'sw' ? `Nunua ${name}?` : `Buy ${name}?`,
      lang === 'sw' ? `Utalipa ${formatTZS(cost)} mara moja.` : `One-time payment of ${formatTZS(cost)}.`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('buy', lang),
          onPress: () => {
            const res = buyProperty(id);
            if (res.ok) {
              buzz(state.settings, 'achievement');
              toast.achievement(
                lang === 'sw' ? `🔑 ${name} ni yako!` : `🔑 ${name} is yours!`,
                lang === 'sw' ? 'Mali, si kodi. Hongera bosi.' : 'Owning, not renting. Congratulations, boss.',
              );
            } else {
              toast.error(
                res.reason === 'not_enough_cash'
                  ? t('not_enough_cash', lang)
                  : res.reason === 'not_unlocked'
                  ? t('not_unlocked', lang)
                  : t('owned', lang),
              );
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
        <Text style={styles.headerTitle}>🏠 {lang === 'sw' ? 'Mali Zako' : 'Your Properties'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card alt>
          <StatRow
            label={lang === 'sw' ? '🏠 Mali unazomiliki' : '🏠 Properties owned'}
            value={`${state.ownedProperties.length}/${PROPERTIES.length}`}
            highlight
          />
          {dailyIncome > 0 && (
            <StatRow
              label={lang === 'sw' ? '💰 Kipato cha kila siku' : '💰 Daily passive income'}
              value={`+${formatTZS(dailyIncome)}`}
              positive
            />
          )}
          <Text style={styles.hint}>
            {lang === 'sw'
              ? 'Kodi unayolipa ni pesa inayotoka. Mali unayomiliki ni pesa inayoingia.'
              : 'Rent you pay is money leaving. Property you own is money arriving.'}
          </Text>
        </Card>

        {PROPERTIES.map((prop) => {
          const owned = state.ownedProperties.includes(prop.id);
          const locked = state.level < prop.unlockLevel;
          const canAfford = state.cash >= prop.cost;

          return (
            <Card key={prop.id} style={[owned && styles.ownedCard, locked && !owned && { opacity: 0.6 }]}>
              <View style={styles.propTop}>
                <Text style={styles.propEmoji}>{prop.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.propName}>
                    {lang === 'sw' ? prop.name : prop.nameEn}
                    {owned ? ' ✅' : ''}
                  </Text>
                  <Text style={styles.propDesc}>
                    {lang === 'sw' ? prop.description : prop.descriptionEn}
                  </Text>
                </View>
              </View>

              <View style={styles.pillRow}>
                {prop.rentFreeLocationId && (
                  <Pill label={lang === 'sw' ? '🚫 Hakuna kodi' : '🚫 Rent-free'} bg={colors.success + '22'} color={colors.success} />
                )}
                {prop.capacityBonus && (
                  <Pill label={`📦 +${prop.capacityBonus}`} bg={colors.info + '22'} color={colors.info} />
                )}
                {prop.dailyIncome && (
                  <Pill label={`💰 +${formatTZS(prop.dailyIncome)}/${lang === 'sw' ? 'siku' : 'day'}`} bg={colors.accent + '33'} color={colors.accentDark} />
                )}
              </View>

              {!owned && (
                <Button
                  title={
                    locked
                      ? `🔒 Level ${prop.unlockLevel}`
                      : `${t('buy', lang)} · ${formatTZS(prop.cost)}`
                  }
                  onPress={() => handleBuy(prop.id, lang === 'sw' ? prop.name : prop.nameEn, prop.cost)}
                  disabled={locked || !canAfford}
                  size="md"
                  fullWidth
                />
              )}
              {!owned && !locked && !canAfford && (
                <Text style={styles.warnText}>
                  {lang === 'sw' ? 'Unahitaji' : 'Need'} {formatTZS(prop.cost - state.cash)} {lang === 'sw' ? 'zaidi' : 'more'}
                </Text>
              )}
            </Card>
          );
        })}
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
  ownedCard: { borderColor: colors.success + '88', borderWidth: 1.5, backgroundColor: '#F4FBF6' },
  propTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  propEmoji: { fontSize: 34 },
  propName: { fontSize: font.md, fontWeight: '800', color: colors.text },
  propDesc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
  pillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: spacing.sm },
  warnText: { color: colors.danger, fontSize: font.xs, textAlign: 'center', marginTop: 4 },
  hint: { fontSize: font.xs, color: colors.textMuted, marginTop: 6, lineHeight: 17 },
});
