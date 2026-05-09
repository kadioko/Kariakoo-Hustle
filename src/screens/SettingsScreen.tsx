import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { netWorth } from '@/game/economy';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatRow } from '@/components/StatRow';
import { Header } from '@/components/Header';
import { ACHIEVEMENTS } from '@/data/achievements';

const SettingRow: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, value, onChange }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#D1D5DB', true: colors.primaryLight }}
      thumbColor={value ? colors.primary : '#f4f3f4'}
      ios_backgroundColor="#D1D5DB"
    />
  </View>
);

function BusinessNameModal({
  current,
  lang,
  onSave,
  onClose,
}: {
  current: string;
  lang: 'sw' | 'en';
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(current);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>
            {lang === 'sw' ? '✏️ Badilisha Jina' : '✏️ Change Name'}
          </Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (name.trim()) onSave(name.trim());
              Keyboard.dismiss();
            }}
            placeholder={lang === 'sw' ? 'Jina la biashara...' : 'Business name...'}
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.modalBtns}>
            <Button title={t('cancel', lang)} onPress={onClose} variant="outline" size="sm" style={{ flex: 1 }} />
            <Button
              title={t('ok', lang)}
              onPress={() => { if (name.trim()) onSave(name.trim()); }}
              size="sm"
              style={{ flex: 1 }}
              disabled={!name.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, setLanguage, setSound, setVibration, setBusinessName, resetGame } = useGame();
  const toast = useToast();
  const lang = language;
  const [showNameModal, setShowNameModal] = useState(false);
  const loanBalance = state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

  const handleSaveName = (name: string) => {
    setBusinessName(name);
    setShowNameModal(false);
    toast.success(
      lang === 'sw' ? 'Jina limebadilishwa!' : 'Name updated!',
      name,
    );
  };

  const handleShare = async () => {
    const nw = formatTZS(netWorth(state));
    const text = t('share_text', lang, { nw });
    await Share.share({ message: text });
  };

  const handleReset = () => {
    Alert.alert(t('reset_progress', lang), t('reset_warning', lang), [
      { text: t('cancel', lang), style: 'cancel' },
      {
        text: t('yes', lang),
        style: 'destructive',
        onPress: async () => {
          await resetGame();
          nav.navigate('Menu' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={`⚙️ ${t('menu_settings', lang)}`} />
      <Button
        title={`← ${t('back', lang)}`}
        onPress={() => nav.goBack()}
        variant="ghost"
        size="sm"
        style={{ alignSelf: 'flex-start', marginLeft: spacing.lg }}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Language */}
        <Card>
          <Text style={styles.cardTitle}>🌐 {t('language', lang)}</Text>
          <View style={styles.langRow}>
            <Button
              title="🇹🇿 Kiswahili"
              onPress={() => setLanguage('sw')}
              variant={lang === 'sw' ? 'primary' : 'outline'}
              size="sm"
              style={{ flex: 1 }}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              title="🇬🇧 English"
              onPress={() => setLanguage('en')}
              variant={lang === 'en' ? 'primary' : 'outline'}
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Business name */}
        <Card>
          <Text style={styles.cardTitle}>🏪 {lang === 'sw' ? 'Jina la Biashara' : 'Business Name'}</Text>
          <TouchableOpacity
            style={styles.nameRow}
            onPress={() => setShowNameModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.nameVal}>{state.businessName}</Text>
            <Text style={styles.editBtn}>✏️ {lang === 'sw' ? 'Badilisha' : 'Edit'}</Text>
          </TouchableOpacity>
        </Card>

        {/* Sound & haptics */}
        <Card>
          <Text style={styles.cardTitle}>🔊 {lang === 'sw' ? 'Sauti & Mtetemo' : 'Sound & Haptics'}</Text>
          <SettingRow label={t('sound', lang)} value={state.settings.sound} onChange={setSound} />
          <SettingRow label={t('vibration', lang)} value={state.settings.vibration} onChange={setVibration} />
        </Card>

        {/* Stats snapshot */}
        <Card>
          <Text style={styles.cardTitle}>📊 {lang === 'sw' ? 'Takwimu' : 'Stats'}</Text>
          <StatRow label={t('day', lang)} value={String(state.day)} />
          <StatRow label={t('level', lang)} value={String(state.level)} />
          <StatRow label={t('reputation', lang)} value={String(state.reputation)} positive={state.reputation > 0} negative={state.reputation < 0} />
          <StatRow label={t('net_worth', lang)} value={formatTZS(netWorth(state))} highlight />
          <StatRow
            label={lang === 'sw' ? 'Clearance cash' : 'Clearance cash'}
            value={formatTZS(state.totalClearanceRevenue)}
          />
          <StatRow
            label={lang === 'sw' ? 'Madeni' : 'Loans'}
            value={formatTZS(loanBalance)}
            negative={loanBalance > 0}
          />
          <StatRow
            label={lang === 'sw' ? 'Mafanikio' : 'Achievements'}
            value={`${state.achievements.length} / ${ACHIEVEMENTS.length}`}
          />
        </Card>

        {/* Share */}
        <Button
          title={`📤 ${lang === 'sw' ? 'Shiriki Biashara Yako' : 'Share Your Business'}`}
          onPress={handleShare}
          variant="secondary"
          fullWidth
        />

        {/* About */}
        <Card alt>
          <Text style={styles.cardTitle}>ℹ️ {t('about', lang)}</Text>
          <Text style={styles.aboutText}>{t('about_text', lang)}</Text>
          <Text style={[styles.aboutText, { marginTop: spacing.sm, fontWeight: '700', color: colors.text }]}>
            v1.1.0 — Kariakoo Hustle: Biashara Empire
          </Text>
        </Card>

        {/* Monetization placeholder */}
        <Card alt style={{ borderColor: colors.accent + '44', borderWidth: 1.5 }}>
          <Text style={styles.cardTitle}>
            📺 {lang === 'sw' ? 'Ads — Hivi Karibuni' : 'Ads — Coming Soon'}
          </Text>
          <Text style={styles.aboutText}>
            {lang === 'sw'
              ? '• Tazama ad → faida mara mbili\n• Tazama ad → recover kutoka hasara\n• Remove Ads (itakuja)'
              : '• Watch ad → double your day bonus\n• Watch ad → recover from a loss\n• Remove Ads (coming soon)'}
          </Text>
        </Card>

        {/* Danger */}
        <Button
          title={`🗑️ ${t('reset_progress', lang)}`}
          onPress={handleReset}
          variant="danger"
          fullWidth
        />
      </ScrollView>

      {showNameModal && (
        <BusinessNameModal
          current={state.businessName}
          lang={lang}
          onSave={handleSaveName}
          onClose={() => setShowNameModal(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardTitle: { fontSize: font.sm, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: { fontSize: font.md, color: colors.text },
  langRow: { flexDirection: 'row' },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameVal: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  editBtn: { fontSize: font.sm, color: colors.primary, fontWeight: '700' },
  aboutText: { fontSize: font.sm, color: colors.textMuted, lineHeight: 22 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.lg,
  },
  modalTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  nameInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.sm },
});
