import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { WORKERS } from '@/data/workers';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Pill } from '@/components/Pill';
import { Header } from '@/components/Header';
import { BoostSummary } from '@/components/BoostSummary';

export const WorkersScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, hireWorker } = useGame();
  const toast = useToast();
  const lang = language;

  const totalSalary = state.workers.reduce((sum, id) => {
    const w = WORKERS.find((x) => x.id === id);
    return sum + (w?.salary ?? 0);
  }, 0);

  const handleHire = (id: string, name: string, salary: number) => {
    const res = hireWorker(id);
    if (res.ok) {
      toast.success(
        lang === 'sw' ? `${name} ameajiriwa!` : `${name} hired!`,
        lang === 'sw' ? `Mshahara: ${formatTZS(salary)}/siku` : `Salary: ${formatTZS(salary)}/day`,
      );
      return;
    }

    const msg =
      res.reason === 'not_enough_cash'
        ? t('not_enough_cash', lang)
        : res.reason === 'already_hired'
          ? lang === 'sw' ? 'Tayari ameajiriwa' : 'Already hired'
          : t('not_unlocked', lang);
    toast.error(msg);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={`👔 ${t('hire_workers', lang)}`}
        subtitle={lang === 'sw'
          ? `${state.workers.length} wafanyakazi · ${formatTZS(totalSalary)}/siku`
          : `${state.workers.length} workers · ${formatTZS(totalSalary)}/day`}
      />
      <Button
        title={`← ${t('back', lang)}`}
        onPress={() => nav.goBack()}
        variant="ghost"
        size="sm"
        style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <BoostSummary state={state} lang={lang} />

        {WORKERS.map((w) => {
          const hired = state.workers.includes(w.id);
          const locked = state.level < w.unlockLevel;
          const canAfford = state.cash >= w.salary;
          const name = lang === 'en' ? w.nameEn : w.name;
          const benefit = lang === 'en' ? w.benefitEn : w.benefit;
          const personality = lang === 'en' ? w.personalityEn : w.personality;

          return (
            <Card key={w.id} style={[hired && styles.hiredCard]}>
              <View style={styles.top}>
                <Text style={styles.emoji}>{w.emoji}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name}>{name}</Text>
                    {hired && (
                      <Pill label={`✓ ${lang === 'sw' ? 'Ameajiriwa' : 'Hired'}`} bg={colors.success} color="#fff" />
                    )}
                    {locked && !hired && (
                      <Pill label={`🔒 L${w.unlockLevel}`} bg="#EFEAD9" color={colors.textMuted} />
                    )}
                  </View>
                  <Text style={styles.benefit}>{benefit}</Text>
                  <Text style={styles.personality}>{personality}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <StatRow
                label={`${t('salary', lang)}`}
                value={`${formatTZS(w.salary)}/siku`}
                negative={!hired}
              />
              {!hired && (
                <Button
                  title={
                    locked
                      ? `🔒 ${t('unlock_level', lang)} ${w.unlockLevel}`
                      : !canAfford
                        ? `${t('not_enough_cash', lang)}`
                        : `✅ ${t('hire', lang)} - ${formatTZS(w.salary)}`
                  }
                  disabled={locked || !canAfford}
                  onPress={() => handleHire(w.id, name, w.salary)}
                  variant={locked || !canAfford ? 'secondary' : 'primary'}
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
  hiredCard: { borderColor: colors.success + '88', backgroundColor: '#F4FFF8', borderWidth: 1.5 },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  emoji: { fontSize: 36 },
  name: { flexShrink: 1, fontSize: font.md, fontWeight: '800', color: colors.text },
  benefit: { fontSize: font.sm, color: colors.primary, marginTop: 2, fontWeight: '600' },
  personality: { fontSize: font.xs, color: colors.textMuted, marginTop: 5, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
