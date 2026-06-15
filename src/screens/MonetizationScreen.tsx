import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import {
  ADS_ENABLED,
  COSMETIC_THEMES,
  INTERSTITIAL_POLICY,
  INTERSTITIALS_ENABLED,
  PREMIUM_ENABLED,
  PREMIUM_ROADMAP,
  REWARDED_AD_OPTIONS,
  RewardedAdType,
} from '@/data/monetization';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';

export const MonetizationScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { language, watchRewardedAd } = useGame();
  const toast = useToast();
  const [loadingReward, setLoadingReward] = useState<RewardedAdType | null>(null);
  const lang = language;

  const handleReward = async (type: RewardedAdType) => {
    setLoadingReward(type);
    const result = await watchRewardedAd(type);
    setLoadingReward(null);
    if (result.ok) {
      toast.success(
        lang === 'sw' ? 'Reward imepatikana' : 'Reward earned',
        lang === 'sw' ? result.message : result.messageEn,
      );
    } else {
      toast.info(
        lang === 'sw' ? 'Reward haijatolewa' : 'No reward granted',
        lang === 'sw' ? result.message : result.messageEn,
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={lang === 'sw' ? '👑 Premium Plan' : '👑 Premium Plan'}
        subtitle={lang === 'sw' ? 'Fair, optional, premium' : 'Fair, optional, premium'}
      />
      <Button
        title={`← ${t('back', lang)}`}
        onPress={() => nav.goBack()}
        variant="ghost"
        size="sm"
        style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.heroKicker}>
              {lang === 'sw' ? 'Monetization ya baadaye' : 'Future monetization'}
            </Text>
            <Text style={styles.heroTitle}>
              {lang === 'sw' ? 'Premium bila kuvunja biashara.' : 'Premium without breaking the business.'}
            </Text>
            <Text style={styles.heroBody}>
              {lang === 'sw'
                ? 'Rewarded ads ziwe chaguo la mchezaji, interstitials ziwe chache sana, na premium iwe content au comfort - sio pay-to-win.'
                : 'Rewarded ads should be player-chosen, interstitials should be very rare, and premium should mean content or comfort, not pay-to-win.'}
            </Text>
          </View>
          <Pill
            label={ADS_ENABLED ? 'Active' : 'Disabled'}
            bg={ADS_ENABLED ? colors.success : '#E5E7EB'}
            color={ADS_ENABLED ? '#fff' : colors.textMuted}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Rewarded Ads za Premium Feel' : 'Premium Rewarded Ad Options'}
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
              <Text style={styles.fairnessLabel}>{lang === 'sw' ? 'Fairness rule' : 'Fairness rule'}</Text>
              <Text style={styles.fairnessText}>{lang === 'sw' ? option.fairnessNote : option.fairnessNoteEn}</Text>
            </View>
            <Button
              title={
                ADS_ENABLED
                  ? 'Watch ad'
                  : lang === 'sw'
                    ? 'Jaribu placeholder'
                    : 'Test placeholder'
              }
              onPress={() => handleReward(option.id)}
              loading={loadingReward === option.id}
              disabled={loadingReward !== null && loadingReward !== option.id}
              variant="secondary"
              size="sm"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ))}

        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Interstitial Policy' : 'Interstitial Policy'}
        </Text>
        <Card alt style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {lang === 'sw' ? 'Very few interstitials' : 'Very few interstitials'}
            </Text>
            <Pill
              label={INTERSTITIALS_ENABLED ? 'Active' : 'Off'}
              bg={INTERSTITIALS_ENABLED ? colors.success : '#E5E7EB'}
              color={INTERSTITIALS_ENABLED ? '#fff' : colors.textMuted}
            />
          </View>
          {INTERSTITIAL_POLICY.map((policy) => (
            <View key={policy.id} style={styles.policyRow}>
              <Text style={styles.policyEmoji}>{policy.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.policyTitle}>{lang === 'sw' ? policy.title : policy.titleEn}</Text>
                <Text style={styles.bodyText}>{lang === 'sw' ? policy.description : policy.descriptionEn}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>
          {lang === 'sw' ? 'Premium Roadmap' : 'Premium Roadmap'}
        </Text>
        {PREMIUM_ROADMAP.map((option) => (
          <Card key={option.id}>
            <View style={styles.optionTop}>
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.inlineTitle}>
                  <Text style={styles.optionTitle}>{lang === 'sw' ? option.title : option.titleEn}</Text>
                  <Pill
                    label={PREMIUM_ENABLED ? 'Active' : 'Later'}
                    bg={PREMIUM_ENABLED ? colors.success : '#E5E7EB'}
                    color={PREMIUM_ENABLED ? '#fff' : colors.textMuted}
                  />
                </View>
                <Text style={styles.bodyText}>{lang === 'sw' ? option.description : option.descriptionEn}</Text>
              </View>
            </View>
            <Text style={styles.premiumNote}>
              {lang === 'sw' ? option.fairnessNote : option.fairnessNoteEn}
            </Text>
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
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    ...shadow.pop,
  },
  heroKicker: { color: '#FFFFFFCC', fontSize: font.xs, fontWeight: '900', textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: font.xl, fontWeight: '900', lineHeight: 28, marginTop: 4 },
  heroBody: { color: '#FFFFFFDD', fontSize: font.sm, lineHeight: 20, marginTop: spacing.sm },
  policyCard: { borderColor: colors.accent + '44', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { flex: 1, fontSize: font.md, fontWeight: '900', color: colors.text },
  bodyText: { fontSize: font.sm, color: colors.textMuted, lineHeight: 20 },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  optionTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  optionEmoji: { fontSize: 34 },
  optionTitle: { flexShrink: 1, fontSize: font.md, fontWeight: '900', color: colors.text, marginBottom: 3 },
  inlineTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  fairnessBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  fairnessLabel: { color: colors.primary, fontSize: font.xs, fontWeight: '900', marginBottom: 2 },
  fairnessText: { color: colors.text, fontSize: font.xs, fontWeight: '700', lineHeight: 18 },
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingTop: spacing.md },
  policyEmoji: { fontSize: 24 },
  policyTitle: { color: colors.text, fontSize: font.sm, fontWeight: '900', marginBottom: 2 },
  premiumNote: { color: colors.primary, fontSize: font.xs, fontWeight: '800', lineHeight: 18, marginTop: spacing.md },
  swatches: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  swatch: {
    width: 42,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#00000022',
  },
});
