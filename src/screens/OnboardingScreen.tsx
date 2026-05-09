import React, { useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { Button } from '@/components/Button';
import { RootStackParamList } from '@/navigation/AppNavigator';

const TIPS = [
  {
    emoji: '💰',
    sw: 'Anza na 50,000 TZS. Nunua mzigo wenye demand ya juu kwanza.',
    en: 'You start with 50,000 TZS. Buy high-demand stock first.',
  },
  {
    emoji: '📦',
    sw: 'Mzigo ukiisha, faida inakuja. Zungushia pesa haraka.',
    en: 'Keep stock moving. The faster you flip, the more you earn.',
  },
  {
    emoji: '⭐',
    sw: 'Sifa nzuri inaongeza mauzo. Epuka bidhaa mbovu.',
    en: 'Good reputation boosts sales. Avoid bad stock choices.',
  },
  {
    emoji: '🎲',
    sw: 'Matukio ya biashara yatakupata. Jibu kwa busara.',
    en: 'Business events will hit you. Respond wisely.',
  },
  {
    emoji: '🏆',
    sw: 'Jenga empire kutoka meza moja hadi matawi mengi Tanzania nzima.',
    en: 'Build your empire from one table to branches across Tanzania.',
  },
];

const DEFAULT_NAMES = [
  'Hustle ya Kariakoo',
  'Biashara ya Mtaa',
  'Duka la Mwanzo',
  'Kariakoo Boss',
  'Empire ya Kariakoo',
];

export const OnboardingScreen: React.FC = () => {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setBusinessName, setLanguage, language, loadError } = useGame();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'language' | 'name' | 'tips'>('language');
  const [tipIdx, setTipIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const lang = language;

  const handleLanguageNext = (selected: 'sw' | 'en') => {
    setLanguage(selected);
    setStep('name');
  };

  const handleNameNext = () => {
    const finalName = name.trim() || DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
    setBusinessName(finalName);
    Keyboard.dismiss();
    setStep('tips');
  };

  const nextTip = () => {
    if (tipIdx < TIPS.length - 1) {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setTimeout(() => setTipIdx((i) => i + 1), 120);
    } else {
      nav.replace('Tabs');
    }
  };

  const warningText = loadError
    ? lang === 'sw'
      ? 'Save ya zamani haikuweza kusomwa. Tumeanza game mpya ili usikwame.'
      : 'Your old save could not be loaded. A new game was started so you can keep playing.'
    : '';

  if (step === 'language') {
    return (
      <View style={styles.root}>
        <Text style={styles.welcomeEmoji}>🛒</Text>
        <Text style={styles.welcome}>Kariakoo Hustle</Text>
        <Text style={styles.welcomeSub}>Chagua lugha ya kucheza / Choose your game language</Text>

        {loadError ? <Text style={styles.warning}>{warningText}</Text> : null}

        <View style={styles.languageStack}>
          <TouchableOpacity
            style={styles.languageCard}
            activeOpacity={0.85}
            onPress={() => handleLanguageNext('sw')}
          >
            <Text style={styles.languageFlag}>🇹🇿</Text>
            <View style={styles.languageCopy}>
              <Text style={styles.languageTitle}>Kiswahili</Text>
              <Text style={styles.languageSub}>Cheza kwa lugha ya mtaani.</Text>
            </View>
            <Text style={styles.languageArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageCard}
            activeOpacity={0.85}
            onPress={() => handleLanguageNext('en')}
          >
            <Text style={styles.languageFlag}>🇬🇧</Text>
            <View style={styles.languageCopy}>
              <Text style={styles.languageTitle}>English</Text>
              <Text style={styles.languageSub}>Play with clear English copy.</Text>
            </View>
            <Text style={styles.languageArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'tips') {
    const tip = TIPS[tipIdx];
    return (
      <View style={styles.root}>
        <View style={styles.tipDots}>
          {TIPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === tipIdx && styles.dotActive]} />
          ))}
        </View>

        <Animated.View style={[styles.tipCard, { opacity: fade }]}>
          <Text style={styles.tipEmoji}>{tip.emoji}</Text>
          <Text style={styles.tipText}>{lang === 'sw' ? tip.sw : tip.en}</Text>
        </Animated.View>

        <Button
          title={
            tipIdx < TIPS.length - 1
              ? lang === 'sw'
                ? 'Inayofuata →'
                : 'Next →'
              : lang === 'sw'
                ? '🚀 Anza Biashara!'
                : '🚀 Start Business!'
          }
          onPress={nextTip}
          size="lg"
          fullWidth
          variant={tipIdx === TIPS.length - 1 ? 'accent' : 'primary'}
        />
        <TouchableOpacity onPress={() => nav.replace('Tabs')} style={{ marginTop: spacing.lg }}>
          <Text style={styles.skip}>{lang === 'sw' ? 'Ruka' : 'Skip'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.root}>
        <Text style={styles.welcomeEmoji}>🛒</Text>
        <Text style={styles.welcome}>
          {lang === 'sw' ? 'Karibu!' : 'Welcome!'}
        </Text>
        <Text style={styles.welcomeSub}>
          {lang === 'sw'
            ? 'Jina la biashara yako ni nini?'
            : "What's your business name?"}
        </Text>

        {loadError ? <Text style={styles.warning}>{warningText}</Text> : null}

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={lang === 'sw' ? 'Hustle ya Kariakoo...' : 'Kariakoo Boss...'}
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={handleNameNext}
            autoFocus
          />
        </View>

        <View style={styles.suggestions}>
          {DEFAULT_NAMES.slice(0, 3).map((n) => (
            <TouchableOpacity key={n} style={styles.suggestion} onPress={() => setName(n)}>
              <Text style={styles.suggestionText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={lang === 'sw' ? 'Endelea →' : 'Continue →'}
          onPress={handleNameNext}
          size="lg"
          fullWidth
          style={{ marginTop: spacing.xl }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  welcomeEmoji: { fontSize: 72 },
  welcome: { color: '#fff', fontSize: font.display, fontWeight: '900', textAlign: 'center' },
  welcomeSub: { color: '#FFFFFFCC', fontSize: font.lg, textAlign: 'center', lineHeight: 26 },
  warning: {
    width: '100%',
    color: '#FFF7ED',
    backgroundColor: '#B4530944',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: spacing.md,
    fontSize: font.sm,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  languageStack: {
    width: '100%',
    gap: spacing.md,
  },
  languageCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF22',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#FFFFFF44',
    padding: spacing.lg,
  },
  languageFlag: { fontSize: 34 },
  languageCopy: { flex: 1, minWidth: 0 },
  languageTitle: { color: '#fff', fontSize: font.lg, fontWeight: '900' },
  languageSub: { color: '#FFFFFFCC', fontSize: font.sm, lineHeight: 20 },
  languageArrow: { color: '#fff', fontSize: font.xl, fontWeight: '900' },
  inputWrap: {
    width: '100%',
    backgroundColor: '#FFFFFF22',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#FFFFFF44',
    overflow: 'hidden',
  },
  input: {
    color: '#fff',
    fontSize: font.xl,
    fontWeight: '700',
    padding: spacing.lg,
    textAlign: 'center',
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  suggestion: {
    backgroundColor: '#FFFFFF22',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
  },
  suggestionText: { color: '#fff', fontSize: font.xs, fontWeight: '600' },
  tipDots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF44',
  },
  dotActive: { backgroundColor: '#fff', width: 22 },
  tipCard: {
    backgroundColor: '#FFFFFF18',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#FFFFFF22',
    width: '100%',
  },
  tipEmoji: { fontSize: 56 },
  tipText: {
    color: '#fff',
    fontSize: font.lg,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  skip: { color: '#FFFFFF88', fontSize: font.sm },
});
