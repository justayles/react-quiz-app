import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterChip } from '../src/components/FilterChip';
import { allQuestions } from '../src/data';
import { DEFAULT_FILTERS, DIFFICULTIES, KINDS, TECHS, TOPICS } from '../src/data/topics';
import type { QuizFilters, Tech } from '../src/data/types';
import { filterQuestions, pickQuiz, ROUND_SIZE } from '../src/lib/pickQuiz';
import { loadFilters, loadProgress, markSeen, saveFilters } from '../src/lib/storage';
import { startSession } from '../src/state/session';
import { colors, radius, space } from '../src/theme';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<QuizFilters>(DEFAULT_FILTERS);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadFilters(), loadProgress()]).then(([saved, progress]) => {
        if (!active) return;
        setFilters(saved);
        setMissedIds(progress.missedIds);
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const update = (next: QuizFilters) => {
    const topics = next.topics.filter((topic) =>
      next.techs.some((tech) => TOPICS[tech].some((item) => item.id === topic)),
    );
    const cleaned = { ...next, topics };
    setFilters(cleaned);
    saveFilters(cleaned).catch(() => undefined);
  };

  const topicChoices = useMemo(() => {
    const map = new Map<string, string>();
    filters.techs.forEach((tech) => {
      TOPICS[tech].forEach((topic) => map.set(topic.id, topic.label));
    });
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [filters.techs]);

  const pool = useMemo(() => filterQuestions(allQuestions, filters), [filters]);
  const missedPool = useMemo(
    () => allQuestions.filter((question) => missedIds.includes(question.id)),
    [missedIds],
  );
  const roundCount = Math.min(ROUND_SIZE, pool.length);

  const begin = async (mode: 'standard' | 'replay-all') => {
    const progress = await loadProgress();
    const questions =
      mode === 'replay-all'
        ? pickQuiz(allQuestions, { ...DEFAULT_FILTERS, topics: [] }, {
            onlyIds: progress.missedIds,
            seenIds: [],
          })
        : pickQuiz(allQuestions, filters, { seenIds: progress.seenIds });
    if (questions.length === 0) return;
    await markSeen(questions.map((question) => question.id));
    startSession(questions, mode === 'replay-all' ? DEFAULT_FILTERS : filters, mode);
    router.push('/quiz');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Android · offline</Text>
        <Text style={styles.title}>Quizzy</Text>
        <Text style={styles.subtitle}>
          Expert drills for JavaScript, TypeScript, React, Next.js, Node, SQL, Prisma, and the
          test runners. Each round is
          25 random questions, with the answer revealed as soon as you choose.
        </Text>

        <Text style={styles.section}>Technology</Text>
        <View style={styles.row}>
          {TECHS.map((tech) => (
            <FilterChip
              key={tech.id}
              label={tech.label}
              selected={filters.techs.includes(tech.id)}
              onPress={() => update({ ...filters, techs: toggle(filters.techs, tech.id as Tech) })}
            />
          ))}
        </View>

        <Text style={styles.section}>Question type</Text>
        <View style={styles.row}>
          {KINDS.map((kind) => (
            <FilterChip
              key={kind.id}
              label={kind.label}
              selected={filters.kinds.includes(kind.id)}
              onPress={() => update({ ...filters, kinds: toggle(filters.kinds, kind.id) })}
            />
          ))}
        </View>

        <Text style={styles.section}>Difficulty</Text>
        <View style={styles.row}>
          {DIFFICULTIES.map((difficulty) => (
            <FilterChip
              key={difficulty.id}
              label={difficulty.label}
              selected={filters.difficulties.includes(difficulty.id)}
              onPress={() =>
                update({ ...filters, difficulties: toggle(filters.difficulties, difficulty.id) })
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Topic</Text>
        <Text style={styles.hint}>Leave them all off to include every topic.</Text>
        <View style={styles.row}>
          {topicChoices.map((topic) => (
            <FilterChip
              key={topic.id}
              label={topic.label}
              selected={filters.topics.includes(topic.id)}
              onPress={() => update({ ...filters, topics: toggle(filters.topics, topic.id) })}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <Text style={styles.pool}>
          {ready ? `${pool.length} questions match · this round ${roundCount}` : 'Loading your history…'}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={roundCount === 0}
          onPress={() => begin('standard')}
          style={({ pressed }) => [
            styles.primary,
            roundCount === 0 && styles.disabled,
            pressed && roundCount > 0 && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {roundCount === 0 ? 'Nothing matches these filters' : `Start ${roundCount} questions`}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={missedPool.length === 0}
          onPress={() => begin('replay-all')}
          style={({ pressed }) => [
            styles.secondary,
            missedPool.length === 0 && styles.disabled,
            pressed && missedPool.length > 0 && styles.pressedSecondary,
          ]}
        >
          <Text style={styles.secondaryText}>
            {missedPool.length === 0
              ? 'No missed questions yet'
              : `Replay missed (${Math.min(ROUND_SIZE, missedPool.length)})`}
          </Text>
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
  content: {
    padding: space.lg,
    paddingBottom: space.xl,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  section: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: space.md,
    marginBottom: space.sm,
  },
  hint: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  pool: {
    color: colors.textMuted,
    fontSize: 13,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.accentPressed,
  },
  primaryText: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: '800',
  },
  secondary: {
    borderRadius: radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pressedSecondary: {
    borderColor: colors.accent,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.45,
  },
});
