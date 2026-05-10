import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { ADS_ENABLED, COSMETIC_THEMES, REWARDED_AD_OPTIONS } from '@/data/monetization';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { t } from '@/utils/i18n';

export const MonetizationScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { language } = useGame();
  const lang = language;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={lang === 'sw' ? '🎁 Rewards & Themes' : '🎁 Rewards & Themes'}
        subtitle={lang === 'sw' ? 'Fair play kwanza' : 'Fair play first'}
      />
      <Button
        title={`← ${t('back', lang)}`}
        onPress={() => nav.goBack()}
        variant="ghost"
        size="sm"
        style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card alt style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {lang === 'sw' ? '🚧 Ads bado hazijawashwa' : '🚧 Ads are not enabled yet'}
            </Text>
            <Pill
              label={ADS_ENABLED ? (lang === 'sw' ? 'Active' : 'Active') : (lang === 'sw' ? 'Disabled' : 'Disabled')}
              bg={ADS_ENABLED ? colors.success : '#E5E7EB'}
              color={ADS_ENABLED ? '#fff' : colors.textMuted}
            />
          </View>
          <Text style={styles.bodyText}>
            {lang === 'sw'
              ? 'Hizi ni placeholders za product design tu. Tutaziwasha baada ya core loop kuwa fun, balanced, na clear.'
              : 'These are product-design placeholders only. They should turn on after the core loop is fun, balanced, and clear.'}
          </Text>
          <Text style={styles.ruleText}>
            {lang === 'sw'
              ? 'Hakuna pay-to-win: hakuna kununua empire, hakuna kuvunja somo la cash flow.'
              : 'No pay-to-win: no buying the empire, no breaking the cash-flow lesson.'}
          </Text>
        </Card>

        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Rewarded Ads za Fair Play' : 'Fair Rewarded Ad Options'}
        </Text>
        {REWARDED_AD_OPTIONS.map((option) => (
          <Card key={option.id}>
            <View style={styles.optionTop}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.optionTitle}>{lang === 'sw' ? option.title : option.titleEn}</Text>
                <Text style={styles.bodyText}>{lang === 'sw' ? option.description : option.descriptionEn}</Text>
              </View>
            </View>
            <View style={styles.fairnessBox}>
              <Text style={styles.fairnessText}>{lang === 'sw' ? option.fairnessNote : option.fairnessNoteEn}</Text>
            </View>
            <Button
              title={lang === 'sw' ? 'Imefungwa kwa sasa' : 'Disabled for now'}
              disabled
              variant="secondary"
              size="sm"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ))}

        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Cosmetic Shop Themes' : 'Cosmetic Shop Themes'}
        </Text>
        {COSMETIC_THEMES.map((theme) => (
          <Card key={theme.id}>
            <View style={styles.optionTop}>
              <Text style={styles.optionEmoji}>{theme.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.optionTitle}>{lang === 'sw' ? theme.name : theme.nameEn}</Text>
                <Text style={styles.bodyText}>{lang === 'sw' ? theme.description : theme.descriptionEn}</Text>
              </View>
            </View>
            <View style={styles.swatches}>
              {theme.colors.map((color) => (
                <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
              ))}
            </View>
            <Button
              title={lang === 'sw' ? 'Cosmetic tu - haijawezeshwa' : 'Cosmetic only - not enabled'}
              disabled
              variant="outline"
              size="sm"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  policyCard: { borderColor: colors.accent + '44', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { flex: 1, fontSize: font.md, fontWeight: '900', color: colors.text },
  bodyText: { fontSize: font.sm, color: colors.textMuted, lineHeight: 20 },
  ruleText: { marginTop: spacing.sm, fontSize: font.sm, color: colors.primary, fontWeight: '800', lineHeight: 20 },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  optionTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  optionEmoji: { fontSize: 34 },
  optionTitle: { fontSize: font.md, fontWeight: '900', color: colors.text, marginBottom: 3 },
  fairnessBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  fairnessText: { color: colors.text, fontSize: font.xs, fontWeight: '700', lineHeight: 18 },
  swatches: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  swatch: {
    width: 42,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#00000022',
  },
});
