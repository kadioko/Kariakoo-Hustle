import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { ACHIEVEMENTS } from '@/data/achievements';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';

export const AchievementsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language } = useGame();
  const lang = language;

  const unlocked = state.achievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={`🏆 ${t('achievements', lang)}`}
        subtitle={`${unlocked}/${total} ${lang === 'sw' ? 'yimepatikana' : 'earned'}`}
      />
      <Button title={`← ${t('back', lang)}`} onPress={() => nav.goBack()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {ACHIEVEMENTS.map((a) => {
          const earned = state.achievements.includes(a.id);
          const title = lang === 'en' ? a.titleEn : a.title;
          const desc = lang === 'en' ? a.descriptionEn : a.description;
          return (
            <Card key={a.id} style={[styles.card, earned && styles.earnedCard, !earned && styles.lockedCard]}>
              <View style={styles.row}>
                <Text style={[styles.emoji, !earned && styles.lockedEmoji]}>{a.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, !earned && { color: colors.textMuted }]}>{title}</Text>
                  <Text style={styles.desc}>{desc}</Text>
                  {a.reward && earned && (
                    <Text style={styles.reward}>
                      🎁 {[
                        a.reward.cash ? `+${a.reward.cash} TZS` : null,
                        a.reward.xp ? `+${a.reward.xp} XP` : null,
                        a.reward.reputation ? `+${a.reward.reputation} ⭐` : null,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
                <Text style={styles.status}>{earned ? '✅' : '🔒'}</Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {},
  earnedCard: { borderColor: colors.accent, backgroundColor: '#FFFDF5' },
  lockedCard: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  emoji: { fontSize: 36 },
  lockedEmoji: { opacity: 0.4 },
  title: { fontSize: font.md, fontWeight: '800', color: colors.text },
  desc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  reward: { fontSize: font.xs, color: colors.accent, fontWeight: '700', marginTop: 6 },
  status: { fontSize: 24 },
});
