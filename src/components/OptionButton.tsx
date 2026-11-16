import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';

type State = 'idle' | 'correct' | 'wrong' | 'dimmed';

export function OptionButton({
  letter,
  label,
  state,
  onPress,
  disabled,
}: {
  letter: string;
  label: string;
  state: State;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        state === 'correct' && styles.correct,
        state === 'wrong' && styles.wrong,
        state === 'dimmed' && styles.dimmed,
        pressed && state === 'idle' && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.letter,
          state === 'correct' && styles.letterCorrect,
          state === 'wrong' && styles.letterWrong,
        ]}
      >
        <Text
          style={[
            styles.letterText,
            (state === 'correct' || state === 'wrong') && styles.letterTextOn,
          ]}
        >
          {letter}
        </Text>
      </View>
      <Text style={[styles.label, state === 'dimmed' && styles.labelDim]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: space.md,
    marginBottom: space.sm,
  },
  pressed: {
    borderColor: colors.accent,
  },
  correct: {
    backgroundColor: colors.correctBg,
    borderColor: colors.correctBorder,
  },
  wrong: {
    backgroundColor: colors.wrongBg,
    borderColor: colors.wrongBorder,
  },
  dimmed: {
    opacity: 0.55,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chip,
  },
  letterCorrect: {
    backgroundColor: colors.correct,
  },
  letterWrong: {
    backgroundColor: colors.wrong,
  },
  letterText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  letterTextOn: {
    color: '#111',
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  labelDim: {
    color: colors.textMuted,
  },
});
