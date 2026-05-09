import React from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { netWorth } from '@/game/economy';
import { ACHIEVEMENTS } from '@/data/achievements';

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
    <View style={{ flex: 1 }}>
      <Text style={styles.menuLabel}>{label}</Text>
      {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

export const MoreScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language } = useGame();
  const lang = language;

  const handleShare = async () => {
    const nw = formatTZS(netWorth(state));
    const text = t('share_text', lang, { nw });
    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{lang === 'sw' ? 'Zaidi' : 'More'}</Text>
        <Text style={styles.sub}>{state.businessName}</Text>
      </View>

      <View style={styles.list}>
        <MenuItem
          emoji="👔"
          label={t('hire_workers', lang)}
          sub={`${state.workers.length} ${lang === 'sw' ? 'wafanyakazi' : 'workers'}`}
          onPress={() => nav.navigate('Workers')}
        />
        <MenuItem
          emoji="📍"
          label={t('locations', lang)}
          sub={`${state.locations.length} ${lang === 'sw' ? 'yimefunguliwa' : 'unlocked'}`}
          onPress={() => nav.navigate('Locations')}
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
          sub={`${state.achievements.length}/${ACHIEVEMENTS.length} ${lang === 'sw' ? 'yimepatikana' : 'earned'}`}
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
      </View>
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
  list: { padding: spacing.lg, gap: spacing.sm },
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
  menuSub: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.textMuted },
});
