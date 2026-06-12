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
import { ADS_ENABLED } from '@/data/monetization';
import packageJson from '../../package.json';

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
              onPress={() => {
                if (name.trim()) onSave(name.trim());
              }}
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

function CheatCodeModal({
  lang,
  onApply,
  onClose,
}: {
  lang: 'sw' | 'en';
  onApply: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>🔐 Secret Menu</Text>
          <Text style={styles.aboutText}>
            {lang === 'sw'
              ? 'Weka cheat code ya majaribio. Hii ni kwa QA na balancing tu.'
              : 'Enter a test cheat code. This is only for QA and balancing.'}
          </Text>
          <TextInput
            style={styles.nameInput}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="KARIOO50K"
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={() => onApply(code)}
          />
          <View style={styles.modalBtns}>
            <Button title={t('cancel', lang)} onPress={onClose} variant="outline" size="sm" style={{ flex: 1 }} />
            <Button
              title={lang === 'sw' ? 'Tumia Code' : 'Apply Code'}
              onPress={() => onApply(code)}
              size="sm"
              style={{ flex: 1 }}
              disabled={!code.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ImportSaveModal({
  lang,
  onImport,
  onClose,
}: {
  lang: 'sw' | 'en';
  onImport: (json: string) => void;
  onClose: () => void;
}) {
  const [json, setJson] = useState('');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>
            📥 {lang === 'sw' ? 'Rejesha Save' : 'Import Save'}
          </Text>
          <Text style={styles.aboutText}>
            {lang === 'sw'
              ? 'Bandika save code uliyo-export hapa. Itafuta progress ya sasa!'
              : 'Paste a previously exported save code here. It will replace your current progress!'}
          </Text>
          <TextInput
            style={[styles.nameInput, { height: 120, fontSize: font.xs, fontWeight: '400', textAlignVertical: 'top' }]}
            value={json}
            onChangeText={setJson}
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            placeholder='{"saveVersion":8,"cash":...}'
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.modalBtns}>
            <Button title={t('cancel', lang)} onPress={onClose} variant="outline" size="sm" style={{ flex: 1 }} />
            <Button
              title={lang === 'sw' ? 'Rejesha' : 'Import'}
              onPress={() => onImport(json)}
              size="sm"
              style={{ flex: 1 }}
              disabled={!json.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const SettingsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const {
    state,
    language,
    setLanguage,
    setSound,
    setVibration,
    setBusinessName,
    applyCheatCode,
    saveStatus,
    lastSavedAt,
    resetGame,
    exportSave,
    importSave,
  } = useGame();
  const toast = useToast();
  const lang = language;
  const [showNameModal, setShowNameModal] = useState(false);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [secretTapCount, setSecretTapCount] = useState(0);
  const loanBalance = state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const savedTime = lastSavedAt ? new Date(lastSavedAt).toLocaleString() : (lang === 'sw' ? 'Bado' : 'Not yet');

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

  const handleExportSave = async () => {
    try {
      await Share.share({ message: exportSave() });
    } catch {
      toast.error(lang === 'sw' ? 'Imeshindikana ku-share save.' : 'Could not share the save.');
    }
  };

  const handleImportSave = (json: string) => {
    Alert.alert(
      lang === 'sw' ? 'Rejesha save hii?' : 'Import this save?',
      lang === 'sw' ? 'Progress ya sasa itafutwa.' : 'Your current progress will be replaced.',
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: t('yes', lang),
          style: 'destructive',
          onPress: () => {
            const res = importSave(json);
            if (res.ok) {
              setShowImportModal(false);
              toast.success(lang === 'sw' ? 'Save imerejeshwa!' : 'Save imported!');
            } else {
              toast.error(
                lang === 'sw' ? 'Save code si sahihi. Hakikisha umebandika yote.' : 'Invalid save code. Make sure you pasted the whole thing.',
              );
            }
          },
        },
      ],
    );
  };

  const handleVersionTap = () => {
    const next = secretTapCount + 1;
    setSecretTapCount(next);
    if (next >= 7) {
      setSecretTapCount(0);
      setShowCheatModal(true);
      toast.info(
        lang === 'sw' ? 'Secret menu imefunguka.' : 'Secret menu unlocked.',
        lang === 'sw' ? 'Tumia kwa majaribio tu.' : 'Use for testing only.',
      );
    }
  };

  const handleApplyCheat = (code: string) => {
    const result = applyCheatCode(code);
    if (result.ok) {
      setShowCheatModal(false);
      toast.success(lang === 'sw' ? result.message : result.messageEn);
    } else {
      toast.error(lang === 'sw' ? result.message : result.messageEn);
    }
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

        <Card>
          <Text style={styles.cardTitle}>🏪 {lang === 'sw' ? 'Jina la Biashara' : 'Business Name'}</Text>
          <TouchableOpacity
            style={styles.nameRow}
            onPress={() => setShowNameModal(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.nameVal} numberOfLines={1}>{state.businessName}</Text>
            <Text style={styles.editBtn}>✏️ {lang === 'sw' ? 'Badilisha' : 'Edit'}</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>🔊 {lang === 'sw' ? 'Sauti & Mtetemo' : 'Sound & Haptics'}</Text>
          <SettingRow label={t('sound', lang)} value={state.settings.sound} onChange={setSound} />
          <SettingRow label={t('vibration', lang)} value={state.settings.vibration} onChange={setVibration} />
        </Card>

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
          <StatRow
            label={lang === 'sw' ? 'Save status' : 'Save status'}
            value={saveStatus === 'error' ? (lang === 'sw' ? 'Imefeli' : 'Failed') : saveStatus === 'saving' ? (lang === 'sw' ? 'Inahifadhi' : 'Saving') : (lang === 'sw' ? 'Imehifadhi' : 'Saved')}
            negative={saveStatus === 'error'}
            highlight={saveStatus === 'saved'}
          />
          <StatRow
            label={lang === 'sw' ? 'Last saved' : 'Last saved'}
            value={savedTime}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>💾 {lang === 'sw' ? 'Backup ya Save' : 'Save Backup'}</Text>
          <Text style={styles.aboutText}>
            {lang === 'sw'
              ? 'Save iko kwenye simu hii tu. Export uihifadhi mahali salama (WhatsApp, Notes, email).'
              : 'Your save lives only on this phone. Export it somewhere safe (WhatsApp, Notes, email).'}
          </Text>
          <View style={[styles.langRow, { marginTop: spacing.md }]}>
            <Button
              title={`📤 ${lang === 'sw' ? 'Export Save' : 'Export Save'}`}
              onPress={handleExportSave}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              title={`📥 ${lang === 'sw' ? 'Import Save' : 'Import Save'}`}
              onPress={() => setShowImportModal(true)}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <Button
          title={`📤 ${lang === 'sw' ? 'Shiriki Biashara Yako' : 'Share Your Business'}`}
          onPress={handleShare}
          variant="secondary"
          fullWidth
        />

        <Card alt>
          <Text style={styles.cardTitle}>ℹ️ {t('about', lang)}</Text>
          <Text style={styles.aboutText}>{t('about_text', lang)}</Text>
          <TouchableOpacity onPress={handleVersionTap} activeOpacity={0.75}>
            <Text style={[styles.aboutText, styles.versionText]}>
              v{packageJson.version} · build {state.saveVersion} · Kariakoo Hustle: Biashara Empire
            </Text>
          </TouchableOpacity>
        </Card>

        <Card alt style={{ borderColor: colors.accent + '44', borderWidth: 1.5 }}>
          <Text style={styles.cardTitle}>
            🎁 {lang === 'sw' ? 'Rewards & Themes' : 'Rewards & Themes'}
          </Text>
          <Text style={styles.aboutText}>
            {lang === 'sw'
              ? ADS_ENABLED
                ? 'Rewarded ads zimewashwa. Remove Ads inaweza kuongezwa kwenye build yenye ads.'
                : 'Rewarded ads zimefungwa hadi game iwe fun na balanced. Cosmetics ni placeholders tu.'
              : ADS_ENABLED
                ? 'Rewarded ads are enabled. Remove Ads can be added in an ads build.'
                : 'Rewarded ads are disabled until the game is fun and balanced. Cosmetics are placeholders only.'}
          </Text>
          <Button
            title={lang === 'sw' ? 'Angalia Plan' : 'View Plan'}
            onPress={() => nav.navigate('Monetization')}
            variant="outline"
            size="sm"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </Card>

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

      {showCheatModal && (
        <CheatCodeModal
          lang={lang}
          onApply={handleApplyCheat}
          onClose={() => setShowCheatModal(false)}
        />
      )}

      {showImportModal && (
        <ImportSaveModal
          lang={lang}
          onImport={handleImportSave}
          onClose={() => setShowImportModal(false)}
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
    gap: spacing.md,
  },
  settingLabel: { flex: 1, fontSize: font.md, color: colors.text },
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
    gap: spacing.sm,
  },
  nameVal: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  editBtn: { fontSize: font.sm, color: colors.primary, fontWeight: '700', flexShrink: 0 },
  aboutText: { fontSize: font.sm, color: colors.textMuted, lineHeight: 22 },
  versionText: { marginTop: spacing.sm, fontWeight: '700', color: colors.text },
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
