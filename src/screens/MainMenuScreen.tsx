import React, { useRef } from 'react';
import { Animated, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { netWorth } from '@/game/economy';
import { Button } from '@/components/Button';
import { RootStackParamList } from '@/navigation/AppNavigator';

export const MainMenuScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, language, resetGame } = useGame();
  const hasSave = state.day > 1 || state.cash !== 50000;

  const handleShare = async () => {
    const nw = formatTZS(netWorth(state));
    const text = t('share_text', language, { nw });
    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🛒</Text>
        <Text style={styles.title}>{t('app_title', language)}</Text>
        <Text style={styles.subtitle}>{t('app_subtitle', language)}</Text>
        <Text style={styles.tagline}>"{t('tagline', language)}"</Text>
      </View>

      <View style={styles.btns}>
        {hasSave ? (
          <>
            <Button
              title={`${t('menu_continue', language)} — ${t('day', language)} ${state.day}`}
              onPress={() => nav.navigate('Tabs')}
              size="lg"
              fullWidth
            />
            <View style={{ height: spacing.md }} />
            <Button
              title={t('menu_new', language)}
              onPress={async () => {
                await resetGame();
                nav.navigate('Tabs');
              }}
              variant="outline"
              size="md"
              fullWidth
            />
          </>
        ) : (
          <Button
            title={t('menu_play', language)}
            onPress={() => nav.navigate('Tabs')}
            size="lg"
            fullWidth
          />
        )}

        <View style={{ height: spacing.md }} />
        <Button
          title={t('menu_settings', language)}
          onPress={() => nav.navigate('Settings')}
          variant="secondary"
          size="md"
          fullWidth
        />

        {hasSave && (
          <>
            <View style={{ height: spacing.md }} />
            <Button
              title="📤 Shiriki"
              onPress={handleShare}
              variant="ghost"
              size="md"
              fullWidth
            />
          </>
        )}
      </View>

      <Text style={styles.footer}>© 2025 Kariakoo Hustle. Pesa za Bandia Tu.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl * 1.5,
  },
  hero: { alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 80 },
  title: { color: '#fff', fontSize: font.xxl, fontWeight: '900' },
  subtitle: { color: '#FFE5A0', fontSize: font.lg, fontWeight: '700' },
  tagline: { color: '#FFFFFF99', fontSize: font.sm, fontStyle: 'italic', textAlign: 'center', marginTop: spacing.sm },
  btns: { width: '100%', alignItems: 'stretch' },
  footer: { color: '#FFFFFF55', fontSize: font.xs, textAlign: 'center' },
});
