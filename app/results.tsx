import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TechBadge } from '../src/components/TechBadge';
import { allQuestions } from '../src/data';
import { DEFAULT_FILTERS, techLabel } from '../src/data/topics';
import type { Tech } from '../src/data/types';
import { pickQuiz } from '../src/lib/pickQuiz';
import { loadProgress, markSeen } from '../src/lib/storage';
import { startSession, useSession } from '../src/state/session';
import { colors, radius, space } from '../src/theme';

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const session = useSession();

  if (!session) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.title}>No score yet</Text>
        <Pressable style={styles.primary} onPress={() => router.replace('/')}>
          <Text style={styles.primaryText}>Back home</Text>
        </Pressable>
      </View>
    );
  }

  const total = session.questions.length;
  const correct = session.answers.filter((answer) => answer?.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  const missed = session.questions.filter((_, index) => !session.answers[index]?.correct);

  const byTech = new Map<Tech, { correct: number; total: number }>();
  session.questions.forEach((question, index) => {
    const row = byTech.get(question.tech) ?? { correct: 0, total: 0 };
    row.total += 1;
    if (session.answers[index]?.correct) row.correct += 1;
    byTech.set(question.tech, row);
  });

  const play = async (mode: 'standard' | 'replay-round') => {
    const progress = await loadProgress();
    const questions =
      mode === 'replay-round'
        ? pickQuiz(
            allQuestions,
            { ...DEFAULT_FILTERS, topics: [] },
            { onlyIds: missed.map((question) => question.id), seenIds: [] },
          )
        : pickQuiz(allQuestions, session.filters, { seenIds: progress.seenIds });
    if (questions.length === 0) return;
    await markSeen(questions.map((question) => question.id));
    startSession(questions, mode === 'standard' ? session.filters : DEFAULT_FILTERS, mode);
    router.replace('/quiz');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Round complete</Text>
        <Text style={styles.score}>
          {correct}/{total}
        </Text>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.subtitle}>
          {percent >= 80
            ? 'Sharp round. The misses are saved so you can drill them again.'
            : 'The ones you missed are saved. Replay them while the explanation is still fresh.'}
        </Text>

        <Text style={styles.section}>By technology</Text>
        {[...byTech.entries()].map(([tech, row]) => (
          <View key={tech} style={styles.row}>
            <TechBadge tech={tech} />
            <Text style={styles.rowLabel}>{techLabel(tech)}</Text>
            <Text style={styles.rowScore}>
              {row.correct}/{row.total}
            </Text>
          </View>
        ))}

        {missed.length > 0 ? (
          <>
            <Text style={styles.section}>Missed this round</Text>
            {missed.map((question) => (
              <Text key={question.id} style={styles.missed}>
                {question.prompt}
              </Text>
            ))}
          </>
        ) : (
          <Text style={styles.subtitle}>Clean sweep. Nothing to replay from this round.</Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Pressable style={styles.primary} onPress={() => play('standard')}>
          <Text style={styles.primaryText}>New random quiz</Text>
        </Pressable>
        <Pressable
          disabled={missed.length === 0}
          onPress={() => play('replay-round')}
          style={[styles.secondary, missed.length === 0 && styles.disabled]}
        >
          <Text style={styles.secondaryText}>
            {missed.length === 0 ? 'Nothing missed' : `Replay ${missed.length} missed`}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.home}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  empty: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.lg,
    justifyContent: 'center',
    gap: space.md,
  },
  content: {
    padding: space.lg,
    paddingBottom: space.xl,
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  score: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '800',
    marginTop: space.sm,
  },
  percent: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: space.sm,
  },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  rowScore: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  missed: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: space.sm,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.accentText,
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    borderRadius: radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  home: {
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '700',
    paddingVertical: space.sm,
  },
  disabled: {
    opacity: 0.45,
  },
});
