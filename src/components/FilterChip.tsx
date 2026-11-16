import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

export function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.chipText,
    fontSize: 13,
    fontWeight: '700',
  },
  labelSelected: {
    color: colors.accentText,
  },
});
