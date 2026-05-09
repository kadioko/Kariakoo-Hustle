import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { t } from '@/utils/i18n';
import { RootStackParamList } from '@/navigation/AppNavigator';

export const SplashScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoaded, state, language } = useGame();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const lang = language;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 60 }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      const isNewPlayer = state.day === 1 && state.cash === 50000 && state.reports.length === 0;
      if (isNewPlayer) {
        nav.replace('Onboarding');
      } else {
        nav.replace('Menu');
      }
    }, 1100);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.inner, { opacity: fade, transform: [{ scale }] }]}>
        <Text style={styles.emoji}>🛒</Text>
        <Text style={styles.title}>{t('app_title', lang)}</Text>
        <Text style={styles.subtitle}>{t('app_subtitle', lang)}</Text>
        <Text style={styles.tagline}>"{t('tagline', lang)}"</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.loading}>
          {lang === 'sw' ? 'Inapakia...' : 'Loading...'}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  inner: { alignItems: 'center', gap: spacing.md },
  emoji: { fontSize: 88 },
  title: { color: '#fff', fontSize: font.display, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#FFE08A', fontSize: font.lg, fontWeight: '700' },
  tagline: {
    color: '#FFFFFF99',
    fontSize: font.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loading: { color: '#FFFFFF66', fontSize: font.xs },
});
