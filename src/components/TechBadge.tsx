import { StyleSheet, Text, View } from 'react-native';
import type { Tech } from '../data/types';
import { techLabel } from '../data/topics';
import { colors, radius } from '../theme';

const TONE: Record<Tech, { bg: string; fg: string }> = {
  javascript: { bg: '#f7df1e', fg: '#1a1604' },
  typescript: { bg: '#3178c6', fg: '#f4f8ff' },
  react19: { bg: '#61dafb', fg: '#062027' },
  next15: { bg: '#e8edf5', fg: '#111318' },
  next16: { bg: '#f0b429', fg: '#1c1404' },
  node: { bg: '#3c873a', fg: '#f3fff2' },
  playwright: { bg: '#e4552d', fg: '#fff7f4' },
  jest: { bg: '#c21325', fg: '#fff5f6' },
  vitest: { bg: '#c4b15a', fg: '#1c1806' },
  rtl: { bg: '#e5e7eb', fg: '#111318' },
  prisma: { bg: '#16a394', fg: '#f3fffc' },
  sql: { bg: '#336791', fg: '#f4f8ff' },
};

export function TechBadge({ tech }: { tech: Tech }) {
  const tone = TONE[tech];
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{techLabel(tech)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export function MetaChip({ label }: { label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.chip,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    color: colors.chipText,
    fontSize: 12,
    fontWeight: '600',
  },
});
