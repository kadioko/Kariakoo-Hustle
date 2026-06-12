import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { LESSON_XP, LESSONS } from '@/data/lessons';

export const LessonsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { state, language, markLessonRead } = useGame();
  const toast = useToast();
  const lang = language;
  const [openId, setOpenId] = useState<string | null>(null);

  const unlockedCount = LESSONS.filter((l) => l.unlocked(state)).length;
  const readCount = state.readLessonIds.length;

  const handleOpen = (id: string) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next) {
      const res = markLessonRead(id);
      if (res.firstRead) {
        toast.success(
          lang === 'sw' ? `+${LESSON_XP} XP — somo jipya!` : `+${LESSON_XP} XP — new lesson!`,
        );
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backBtn}>← {t('back', lang)}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📚 {lang === 'sw' ? 'Masomo ya Biashara' : 'Business School'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card alt>
          <Text style={styles.intro}>
            {lang === 'sw'
              ? 'Kila kitu unachofanya kwenye game hii ni somo halisi la biashara. Soma, ujifunze, utumie — ndani na nje ya mchezo.'
              : 'Everything you do in this game is a real business lesson. Read, learn, apply — inside the game and out.'}
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar value={readCount} max={LESSONS.length} height={8} color={colors.accent} />
            <Text style={styles.progressText}>
              {readCount}/{LESSONS.length} {lang === 'sw' ? 'yamesomwa' : 'read'} · {unlockedCount} {lang === 'sw' ? 'yamefunguliwa' : 'unlocked'}
            </Text>
          </View>
        </Card>

        {LESSONS.map((lesson) => {
          const unlocked = lesson.unlocked(state);
          const read = state.readLessonIds.includes(lesson.id);
          const open = openId === lesson.id;

          if (!unlocked) {
            return (
              <Card key={lesson.id} style={{ opacity: 0.55 }}>
                <View style={styles.lessonTop}>
                  <Text style={styles.lessonEmoji}>🔒</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle}>
                      {lang === 'sw' ? lesson.title : lesson.titleEn}
                    </Text>
                    <Text style={styles.lockHint}>
                      {lang === 'sw' ? lesson.unlockHint : lesson.unlockHintEn}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }

          return (
            <TouchableOpacity key={lesson.id} onPress={() => handleOpen(lesson.id)} activeOpacity={0.8}>
              <Card style={read ? styles.readCard : undefined}>
                <View style={styles.lessonTop}>
                  <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lessonTitle}>
                      {lang === 'sw' ? lesson.title : lesson.titleEn} {read ? '✅' : ''}
                    </Text>
                    {!open && (
                      <Text style={styles.tapHint}>
                        {lang === 'sw' ? 'Gonga kusoma' : 'Tap to read'}
                        {!read ? ` · +${LESSON_XP} XP` : ''}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
                </View>
                {open && (
                  <Text style={styles.body}>
                    {lang === 'sw' ? lesson.body : lesson.bodyEn}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footer}>
          {lang === 'sw'
            ? 'Masomo haya ni ya kielimu tu, si ushauri wa kifedha.'
            : 'These lessons are educational only, not financial advice.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { color: colors.primary, fontSize: font.sm, fontWeight: '700' },
  headerTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  intro: { color: colors.textMuted, fontSize: font.sm, lineHeight: 20 },
  progressText: { fontSize: font.xs, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  lessonTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  lessonEmoji: { fontSize: 28 },
  lessonTitle: { fontSize: font.md, fontWeight: '800', color: colors.text },
  lockHint: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  tapHint: { fontSize: font.xs, color: colors.primary, marginTop: 2, fontWeight: '700' },
  chevron: { fontSize: 18, color: colors.textMuted },
  body: { fontSize: font.sm, color: colors.text, lineHeight: 22, marginTop: spacing.md },
  readCard: { borderColor: colors.success + '55' },
  footer: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', paddingBottom: spacing.xl },
});
