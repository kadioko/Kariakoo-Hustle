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
import { CITIES } from '@/game/cities';

const CATEGORY_LABEL: Record<string, { sw: string; en: string }> = {
  phone_accessories: { sw: 'Simu', en: 'Phone' },
  clothes: { sw: 'Nguo', en: 'Clothes' },
  shoes: { sw: 'Viatu', en: 'Shoes' },
  cosmetics: { sw: 'Vipodozi', en: 'Beauty' },
  electronics: { sw: 'Elektro', en: 'Electronics' },
  food: { sw: 'Chakula', en: 'Food' },
  spare_parts: { sw: 'Spea', en: 'Parts' },
  school: { sw: 'Shule', en: 'School' },
  home: { sw: 'Nyumba', en: 'Home' },
  imported: { sw: 'Import', en: 'Imports' },
};

export const TravelScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, travelTo } = useGame();
  const toast = useToast();
  const lang = language;

  const handleTravel = (cityId: string, name: string, cost: number) => {
    Alert.alert(
      lang === 'sw' ? `Safiri kwenda ${name}?` : `Travel to ${name}?`,
      lang === 'sw'
        ? `Gharama: ${formatTZS(cost)}. Safari inachukua siku nzima — hakuna mauzo leo. Mzigo unaweza kupotea njiani.`
        : `Cost: ${formatTZS(cost)}. The trip takes the whole day — no sales today. Stock can be lost on the road.`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: lang === 'sw' ? 'Safiri' : 'Travel',
          onPress: () => {
            const res = travelTo(cityId);
            if (res.ok) {
              buzz(state.settings, 'success');
              if ((res.lostUnits ?? 0) > 0) {
                toast.error(
                  lang === 'sw' ? `Umefika ${name}...` : `Arrived in ${name}...`,
                  lang === 'sw'
                    ? `lakini vipande ${res.lostUnits} vimepotea njiani!`
                    : `but ${res.lostUnits} units were lost on the road!`,
                );
              } else {
                toast.success(
                  lang === 'sw' ? `Karibu ${name}!` : `Welcome to ${name}!`,
                  lang === 'sw' ? 'Safari salama, mzigo wote upo.' : 'Safe trip, all stock intact.',
                );
              }
              nav.goBack();
            } else {
              toast.error(
                res.reason === 'not_enough_cash'
                  ? t('not_enough_cash', lang)
                  : res.reason === 'not_unlocked'
                  ? t('not_unlocked', lang)
                  : lang === 'sw' ? 'Tayari upo hapa.' : 'You are already here.',
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
        <Text style={styles.headerTitle}>🚌 {lang === 'sw' ? 'Safari za Biashara' : 'Trade Routes'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={styles.intro}>
          {lang === 'sw'
            ? 'Kila mji una bidhaa zake za bei poa. Nunua pale zinapozalishwa, uza pale zinapohitajika.'
            : 'Every city has its own cheap goods. Buy where they are made, sell where they are wanted.'}
        </Text>

        {CITIES.map((city) => {
          const isHere = state.currentCityId === city.id;
          const locked = state.level < city.unlockLevel;
          const canAfford = state.cash >= city.travelCost;
          const specialties = Object.entries(city.buyFactors).map(([cat, factor]) => ({
            label: CATEGORY_LABEL[cat]?.[lang] ?? cat,
            off: Math.round((1 - (factor ?? 1)) * 100),
          }));

          return (
            <Card key={city.id} style={[isHere && styles.hereCard, locked && { opacity: 0.6 }]}>
              <View style={styles.cityTop}>
                <Text style={styles.cityEmoji}>{city.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cityName}>
                    {lang === 'sw' ? city.name : city.nameEn}
                    {isHere ? `  📍 ${lang === 'sw' ? 'Upo hapa' : "You're here"}` : ''}
                  </Text>
                  <Text style={styles.cityDesc}>
                    {lang === 'sw' ? city.description : city.descriptionEn}
                  </Text>
                </View>
              </View>

              <View style={styles.pillRow}>
                {specialties.map((s) => (
                  <Pill
                    key={s.label}
                    label={`${s.label} −${s.off}%`}
                    bg={colors.success + '22'}
                    color={colors.success}
                  />
                ))}
                {city.demandFactor !== 1 && (
                  <Pill
                    label={`${lang === 'sw' ? 'Demand' : 'Demand'} ${city.demandFactor > 1 ? '+' : ''}${Math.round((city.demandFactor - 1) * 100)}%`}
                    bg={(city.demandFactor > 1 ? colors.info : colors.warning) + '22'}
                    color={city.demandFactor > 1 ? colors.info : colors.warning}
                  />
                )}
                {city.travelRisk > 0 && (
                  <Pill
                    label={`${lang === 'sw' ? 'Hatari' : 'Risk'} ${Math.round(city.travelRisk * 100)}%`}
                    bg={colors.danger + '18'}
                    color={colors.danger}
                  />
                )}
              </View>

              {!isHere && (
                <>
                  <StatRow
                    label={lang === 'sw' ? 'Nauli na usafirishaji' : 'Fare & freight'}
                    value={city.travelCost > 0 ? `−${formatTZS(city.travelCost)}` : lang === 'sw' ? 'Bure' : 'Free'}
                    negative={city.travelCost > 0}
                  />
                  <Button
                    title={
                      locked
                        ? `🔒 Level ${city.unlockLevel}`
                        : lang === 'sw' ? `Safiri (siku 1)` : 'Travel (1 day)'
                    }
                    onPress={() => handleTravel(city.id, lang === 'sw' ? city.name : city.nameEn, city.travelCost)}
                    disabled={locked || !canAfford}
                    size="md"
                    fullWidth
                  />
                  {!locked && !canAfford && (
                    <Text style={styles.warnText}>❌ {t('not_enough_cash', lang)}</Text>
                  )}
                </>
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
  intro: { color: colors.textMuted, fontSize: font.sm, lineHeight: 20 },
  hereCard: { borderColor: colors.primary, borderWidth: 1.5 },
  cityTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  cityEmoji: { fontSize: 34 },
  cityName: { fontSize: font.md, fontWeight: '800', color: colors.text },
  cityDesc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
  pillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: spacing.sm },
  warnText: { color: colors.danger, fontSize: font.xs, textAlign: 'center', marginTop: 4 },
});
