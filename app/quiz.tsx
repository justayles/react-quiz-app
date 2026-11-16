import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExplanationPanel } from '../src/components/ExplanationPanel';
import { OptionButton } from '../src/components/OptionButton';
import { ProgressBar } from '../src/components/ProgressBar';
import { CodeBlock } from '../src/components/CodeBlock';
import { MetaChip, TechBadge } from '../src/components/TechBadge';
import { kindLabel, topicLabel } from '../src/data/topics';
import { recordAnswer } from '../src/lib/storage';
import { advance, answerCurrent, useSession } from '../src/state/session';
import { colors, radius, space } from '../src/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const session = useSession();
  const [showAnswer, setShowAnswer] = useState(false);
  const index = session?.index ?? 0;

  useEffect(() => {
    setShowAnswer(false);
  }, [index]);

  const confirmQuit = useCallback(() => {
    Alert.alert('Leave this quiz?', 'Answered questions stay in your missed list.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.back() },
    ]);
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', confirmQuit);
      return () => sub.remove();
    }, [confirmQuit]),
  );

  if (!session || session.questions.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.prompt}>No quiz is in progress.</Text>
        <Pressable style={styles.primary} onPress={() => router.replace('/')}>
          <Text style={styles.primaryText}>Back home</Text>
        </Pressable>
      </View>
    );
  }

  const question = session.questions[session.index];
  const given = session.answers[session.index];
  const answered = given !== null;
  const last = session.index === session.questions.length - 1;

  const choose = (optionIndex: number) => {
    const result = answerCurrent(optionIndex);
    if (!result) return;
    recordAnswer(result.id, result.correct).catch(() => undefined);
  };

  const next = () => {
    const step = advance();
    if (step === 'done') router.replace('/results');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.count}>
            Question {session.index + 1} of {session.questions.length}
          </Text>
          <Pressable onPress={confirmQuit} hitSlop={8}>
            <Text style={styles.leave}>Leave</Text>
          </Pressable>
        </View>
        <ProgressBar value={(session.index + (answered ? 1 : 0)) / session.questions.length} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badges}>
          <TechBadge tech={question.tech} />
          <MetaChip label={topicLabel(question.tech, question.topic)} />
          <MetaChip label={kindLabel(question.kind)} />
        </View>
        <Text style={styles.prompt}>{question.prompt}</Text>
        {question.code ? <CodeBlock lang={question.code.lang} source={question.code.source} /> : null}

        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            let state: 'idle' | 'correct' | 'wrong' | 'dimmed' = 'idle';
            if (given) {
              if (optionIndex === question.correctIndex) state = 'correct';
              else if (optionIndex === given.selected) state = 'wrong';
              else state = 'dimmed';
            }
            return (
              <OptionButton
                key={`${question.id}-${option}`}
                letter={LETTERS[optionIndex]}
                label={option}
                state={state}
                disabled={answered}
                onPress={() => choose(optionIndex)}
              />
            );
          })}
        </View>

        {answered && showAnswer ? <ExplanationPanel question={question} /> : null}
      </ScrollView>

      {answered ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <View style={styles.feedbackRow}>
            <Text style={[styles.verdict, given.correct ? styles.good : styles.bad]}>
              {given.correct ? 'Correct' : 'Wrong'}
            </Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>See answer</Text>
              <Switch
                value={showAnswer}
                onValueChange={setShowAnswer}
                trackColor={{ false: colors.chip, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={next}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>{last ? 'See score' : 'Next question'}</Text>
          </Pressable>
        </View>
      ) : null}
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
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  leave: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  prompt: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    marginTop: space.md,
  },
  options: {
    marginTop: space.lg,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verdict: {
    fontSize: 18,
    fontWeight: '800',
  },
  good: {
    color: colors.correct,
  },
  bad: {
    color: colors.wrong,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
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
});
