import React from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { netWorth } from '@/game/economy';
import { ACHIEVEMENTS } from '@/data/achievements';
import {
  canPrestige,
  legacySalesBoost,
  legacyStartingCash,
  PRESTIGE_NET_WORTH,
  prestigeProgress,
} from '@/game/prestige';

const MenuItem = ({
  emoji,
  label,
  sub,
  onPress,
}: {
  emoji: string;
  label: string;
  sub?: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.menuEmoji}>{emoji}</Text>
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.menuLabel}>{label}</Text>
      {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

export const MoreScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, prestige } = useGame();
  const toast = useToast();
  const lang = language;

  const handleShare = async () => {
    const nw = formatTZS(netWorth(state));
    const text = t('share_text', lang, { nw });
    await Share.share({ message: text });
  };

  const eligible = canPrestige(state);
  const progressPct = Math.round(prestigeProgress(state) * 100);
  const nextLegacy = state.legacyLevel + 1;

  const handlePrestige = () => {
    if (!eligible) {
      toast.error(
        lang === 'sw'
          ? `Unahitaji thamani ya ${formatTZS(PRESTIGE_NET_WORTH)}. Sasa: ${progressPct}%`
          : `You need ${formatTZS(PRESTIGE_NET_WORTH)} net worth. Currently: ${progressPct}%`,
      );
      return;
    }
    Alert.alert(
      lang === 'sw' ? '🏛️ Anzisha Ukoo Mpya?' : '🏛️ Start a New Legacy?',
      lang === 'sw'
        ? `Biashara itaanza upya, LAKINI utapata:\n\n• +${Math.round(legacySalesBoost(nextLegacy) * 100)}% mauzo milele\n• Mtaji wa kuanzia ${formatTZS(legacyStartingCash(nextLegacy))}\n• Mafanikio yako yanabaki\n\nHii haiwezi kurudishwa.`
        : `Your business restarts, BUT you gain:\n\n• +${Math.round(legacySalesBoost(nextLegacy) * 100)}% sales forever\n• ${formatTZS(legacyStartingCash(nextLegacy))} starting capital\n• Achievements are kept\n\nThis cannot be undone.`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: lang === 'sw' ? 'Anzisha Ukoo' : 'Start Legacy',
          style: 'destructive',
          onPress: () => {
            const res = prestige();
            if (res.ok) {
              toast.achievement(
                lang === 'sw' ? '🏛️ Ukoo Mpya!' : '🏛️ New Legacy!',
                lang === 'sw'
                  ? `Legacy ${nextLegacy} — mauzo +${Math.round(legacySalesBoost(nextLegacy) * 100)}% milele.`
                  : `Legacy ${nextLegacy} — sales +${Math.round(legacySalesBoost(nextLegacy) * 100)}% forever.`,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{lang === 'sw' ? 'Zaidi' : 'More'}</Text>
        <Text style={styles.sub}>{state.businessName}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <MenuItem
          emoji="👔"
          label={t('hire_workers', lang)}
          sub={`${state.workers.length} ${lang === 'sw' ? 'wafanyakazi' : 'workers'}`}
          onPress={() => nav.navigate('Workers')}
        />
        <MenuItem
          emoji="📍"
          label={t('locations', lang)}
          sub={`${state.locations.length} ${lang === 'sw' ? 'yamefunguliwa' : 'unlocked'}`}
          onPress={() => nav.navigate('Locations')}
        />
        <MenuItem
          emoji="🚌"
          label={lang === 'sw' ? 'Safari za Biashara' : 'Trade Routes'}
          sub={lang === 'sw' ? 'Arusha, Mwanza, Zanzibar — bei za mikoani' : 'Arusha, Mwanza, Zanzibar — regional prices'}
          onPress={() => nav.navigate('Travel')}
        />
        <MenuItem
          emoji="🏠"
          label={lang === 'sw' ? 'Mali (Properties)' : 'Properties'}
          sub={
            state.ownedProperties.length > 0
              ? `${state.ownedProperties.length} ${lang === 'sw' ? 'unazomiliki' : 'owned'}`
              : lang === 'sw' ? 'Acha kupanga, anza kumiliki' : 'Stop renting, start owning'
          }
          onPress={() => nav.navigate('Property')}
        />
        <MenuItem
          emoji="📚"
          label={lang === 'sw' ? 'Masomo ya Biashara' : 'Business School'}
          sub={`${state.readLessonIds.length} ${lang === 'sw' ? 'yamesomwa' : 'lessons read'}`}
          onPress={() => nav.navigate('Lessons')}
        />
        <MenuItem
          emoji="🏛️"
          label={lang === 'sw' ? 'Mtaji wa Ukoo (Prestige)' : 'Family Legacy (Prestige)'}
          sub={
            eligible
              ? lang === 'sw' ? '✨ Tayari! Gonga kuanzisha ukoo mpya' : '✨ Ready! Tap to start a new legacy'
              : `${lang === 'sw' ? 'Legacy' : 'Legacy'} ${state.legacyLevel} · ${progressPct}% → ${formatTZS(PRESTIGE_NET_WORTH)}`
          }
          onPress={handlePrestige}
        />
        <MenuItem
          emoji="🏦"
          label={lang === 'sw' ? 'Benki & Mikopo' : 'Bank & Loans'}
          sub={
            state.loans.length > 0
              ? `${state.loans.length} ${lang === 'sw' ? 'mikopo inayoendelea' : 'active loans'}`
              : lang === 'sw' ? 'Chukua mkopo wa biashara' : 'Take a business loan'
          }
          onPress={() => nav.navigate('Bank')}
        />
        <MenuItem
          emoji="🎁"
          label={lang === 'sw' ? 'Rewards & Themes' : 'Rewards & Themes'}
          sub={lang === 'sw' ? 'Ads zimefungwa, cosmetics placeholder' : 'Ads disabled, cosmetics placeholder'}
          onPress={() => nav.navigate('Monetization')}
        />
        <MenuItem
          emoji="📊"
          label={t('reports', lang)}
          sub={`${state.reports.length} ${lang === 'sw' ? 'ripoti' : 'reports'}`}
          onPress={() => nav.navigate('Reports')}
        />
        <MenuItem
          emoji="🏆"
          label={t('achievements', lang)}
          sub={`${state.achievements.length}/${ACHIEVEMENTS.length} ${lang === 'sw' ? 'yamepatikana' : 'earned'}`}
          onPress={() => nav.navigate('Achievements')}
        />
        <MenuItem
          emoji="📤"
          label={lang === 'sw' ? 'Shiriki Biashara' : 'Share Business'}
          sub={formatTZS(netWorth(state))}
          onPress={handleShare}
        />
        <MenuItem
          emoji="⚙️"
          label={t('menu_settings', lang)}
          onPress={() => nav.navigate('Settings')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    ...shadow.card,
    gap: spacing.md,
  },
  menuEmoji: { fontSize: 28 },
  menuLabel: { fontSize: font.md, fontWeight: '700', color: colors.text },
  menuSub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  chevron: { fontSize: 20, color: colors.textMuted },
});
