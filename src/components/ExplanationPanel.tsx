import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Question } from '../data/types';
import { explanationCodeBlocks } from '../lib/snippets';
import { colors, radius, space } from '../theme';
import { CodeBlock } from './CodeBlock';

const LETTERS = ['A', 'B', 'C', 'D'];

export function ExplanationPanel({ question }: { question: Question }) {
  const wrong = question.options
    .map((option, index) => ({ option, index }))
    .filter((item) => item.index !== question.correctIndex);
  const codeBlocks = explanationCodeBlocks(question);
  const earlyBlock = codeBlocks[0];
  const lateBlock = codeBlocks[1];

  return (
    <View style={styles.wrap}>
      {question.versionNote ? (
        <View style={styles.version}>
          <Text style={styles.kicker}>Version note</Text>
          <Text style={styles.body}>{question.versionNote}</Text>
        </View>
      ) : null}

      <View style={styles.answer}>
        <Text style={styles.kicker}>Answer</Text>
        <Text style={styles.body}>{question.explanation.answer}</Text>
      </View>

      <Text style={styles.heading}>Why</Text>
      <Text style={styles.body}>{question.explanation.why}</Text>

      {earlyBlock ? (
        <View style={styles.block}>
          <Text style={styles.heading}>{earlyBlock.title}</Text>
          <CodeBlock lang={earlyBlock.snippet.lang} source={earlyBlock.snippet.source} />
        </View>
      ) : null}

      <Text style={styles.heading}>Why the others are wrong</Text>
      {wrong.map((item) => {
        const reason = question.explanation.wrong.find((entry) => entry.option === item.option);
        return (
          <View key={item.option} style={styles.wrongRow}>
            <Text style={styles.letter}>{LETTERS[item.index]}</Text>
            <View style={styles.wrongCopy}>
              <Text style={styles.optionText}>{item.option}</Text>
              <Text style={styles.reason}>{reason?.reason ?? 'This option does not match the behaviour.'}</Text>
            </View>
          </View>
        );
      })}

      {lateBlock ? (
        <View style={styles.block}>
          <Text style={styles.heading}>{lateBlock.title}</Text>
          <CodeBlock lang={lateBlock.snippet.lang} source={lateBlock.snippet.source} />
        </View>
      ) : null}

      <View style={styles.remember}>
        <Text style={styles.kicker}>Remember</Text>
        <Text style={styles.body}>{question.explanation.remember}</Text>
      </View>

      {question.explanation.docs ? (
        <Pressable onPress={() => Linking.openURL(question.explanation.docs!)}>
          <Text style={styles.docs}>Read more</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.md,
    gap: space.sm,
  },
  version: {
    backgroundColor: colors.versionBg,
    borderColor: colors.versionBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: 4,
  },
  answer: {
    backgroundColor: colors.correctBg,
    borderColor: colors.correctBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: 4,
  },
  remember: {
    backgroundColor: colors.rememberBg,
    borderColor: colors.rememberBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    gap: 4,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: space.xs,
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  wrongRow: {
    flexDirection: 'row',
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  letter: {
    color: colors.accent,
    fontWeight: '800',
    width: 18,
  },
  wrongCopy: {
    flex: 1,
    gap: 4,
  },
  optionText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  reason: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  block: {
    gap: 4,
  },
  docs: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: space.sm,
  },
});
