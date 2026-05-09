import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { UPGRADES } from '@/data/upgrades';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Pill } from '@/components/Pill';
import { Header } from '@/components/Header';
import { BoostSummary } from '@/components/BoostSummary';

export const UpgradesScreen: React.FC = () => {
  const { state, language, buyUpgrade } = useGame();
  const toast = useToast();
  const lang = language;

  const handleBuy = (id: string, name: string, cost: number) => {
    Alert.alert(
      lang === 'sw' ? `Nunua ${name}?` : `Buy ${name}?`,
      formatTZS(cost),
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('buy_upgrade', lang),
          onPress: () => {
            const res = buyUpgrade(id);
            if (res.ok) {
              toast.success(
                lang === 'sw' ? `${name} imenunuliwa!` : `${name} purchased!`,
              );
            } else {
              const msg =
                res.reason === 'not_enough_cash'
                  ? t('not_enough_cash', lang)
                  : res.reason === 'already_owned'
                  ? (lang === 'sw' ? 'Tayari umeshanunua' : 'Already owned')
                  : t('not_unlocked', lang);
              toast.error(msg);
            }
          },
        },
      ],
    );
  };

  const owned = UPGRADES.filter((u) => state.upgrades.includes(u.id));
  const available = UPGRADES.filter((u) => !state.upgrades.includes(u.id) && state.level >= u.unlockLevel);
  const locked = UPGRADES.filter((u) => !state.upgrades.includes(u.id) && state.level < u.unlockLevel);

  const renderUpgrade = (u: typeof UPGRADES[0]) => {
    const isOwned = state.upgrades.includes(u.id);
    const isLocked = state.level < u.unlockLevel;
    const canAfford = state.cash >= u.cost;
    const name = lang === 'en' ? u.nameEn : u.name;
    const benefit = lang === 'en' ? u.benefitEn : u.benefit;
    const desc = lang === 'en' ? u.descriptionEn : u.description;

    return (
      <Card key={u.id} style={[isOwned && styles.ownedCard, isLocked && !isOwned && styles.lockedCard]}>
        <View style={styles.top}>
          <Text style={[styles.emoji, isLocked && !isOwned && { opacity: 0.4 }]}>{u.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.name}>{name}</Text>
              {isOwned && (
                <Pill label="✓" bg={colors.success} color="#fff" />
              )}
              {isLocked && !isOwned && (
                <Pill label={`🔒 L${u.unlockLevel}`} bg="#EFEAD9" color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.desc}>{desc}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <StatRow
          label={lang === 'sw' ? '⭐ Faida' : '⭐ Benefit'}
          value={benefit}
          positive
        />
        {!isOwned && (
          <StatRow
            label={t('cost', lang)}
            value={formatTZS(u.cost)}
            negative={!canAfford}
            highlight={canAfford && !isLocked}
          />
        )}
        {!isOwned && (
          <Button
            title={
              isLocked
                ? `🔒 ${t('unlock_level', lang)} ${u.unlockLevel}`
                : !canAfford
                ? `${t('not_enough_cash', lang)} · ${formatTZS(u.cost - state.cash)} ${lang === 'sw' ? 'zaidi' : 'more needed'}`
                : `🛒 ${t('buy_upgrade', lang)}`
            }
            onPress={() => handleBuy(u.id, name, u.cost)}
            disabled={isLocked || !canAfford}
            variant={isLocked || !canAfford ? 'secondary' : 'primary'}
            size="sm"
            style={{ marginTop: spacing.sm }}
            fullWidth
          />
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header
        title={`🛠️ ${t('upgrades', lang)}`}
        subtitle={`${state.upgrades.length}/${UPGRADES.length} ${lang === 'sw' ? 'yemenunuliwa' : 'owned'}`}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Boost summary */}
        <BoostSummary state={state} lang={lang} />

        {/* Available upgrades */}
        {available.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              {lang === 'sw' ? '🛒 Zinazopatikana' : '🛒 Available'}
            </Text>
            {available.map(renderUpgrade)}
          </>
        )}

        {/* Owned */}
        {owned.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              {lang === 'sw' ? '✅ Ulizinunua' : '✅ Owned'}
            </Text>
            {owned.map(renderUpgrade)}
          </>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              {lang === 'sw' ? '🔒 Zimefungwa' : '🔒 Locked'}
            </Text>
            {locked.map(renderUpgrade)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ownedCard: { borderColor: colors.success + '66', backgroundColor: '#F4FFF8', borderWidth: 1.5 },
  lockedCard: { opacity: 0.65 },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  top: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.sm },
  emoji: { fontSize: 36 },
  name: { fontSize: font.md, fontWeight: '800', color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
