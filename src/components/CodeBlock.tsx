import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '../data/types';
import { colors, radius, space } from '../theme';

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'async', 'await', 'import',
  'export', 'from', 'type', 'interface', 'new', 'class', 'extends', 'static', 'typeof',
  'instanceof', 'of', 'true', 'false', 'null', 'undefined', 'void', 'this', 'super',
  'try', 'catch', 'throw', 'switch', 'case', 'break', 'continue', 'default', 'for',
  'while', 'do', 'yield', 'as', 'satisfies', 'keyof', 'infer', 'readonly', 'never',
  'unknown', 'any', 'string', 'number', 'boolean', 'in', 'implements', 'enum', 'public',
  'private', 'protected', 'declare', 'module', 'namespace', 'abstract',
]);

const TOKEN =
  /(\/\/.*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|<\/?[A-Za-z][\w.]*)/g;

function colorFor(token: string): string {
  if (token.startsWith('//') || token.startsWith('/*')) return colors.comment;
  if (token.startsWith("'") || token.startsWith('"') || token.startsWith('`')) return colors.string;
  if (token.startsWith('<')) return colors.tag;
  if (/^\d/.test(token)) return colors.number;
  if (KEYWORDS.has(token)) return colors.keyword;
  return colors.codeText;
}

function colorize(line: string) {
  const parts: { text: string; color: string }[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: line.slice(last, index), color: colors.codeText });
    parts.push({ text: match[0], color: colorFor(match[0]) });
    last = index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), color: colors.codeText });
  if (parts.length === 0) parts.push({ text: ' ', color: colors.codeText });
  return parts;
}

export function CodeBlock({ source, lang }: { source: string; lang: Lang }) {
  const lines = source.replace(/\n$/, '').split('\n');
  return (
    <View style={styles.wrap}>
      <Text style={styles.lang}>{lang}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
        <View style={styles.body}>
          {lines.map((line, index) => (
            <View key={`${index}-${line}`} style={styles.row}>
              <Text style={styles.gutter}>{index + 1}</Text>
              <Text style={styles.code}>
                {colorize(line).map((part, partIndex) => (
                  <Text key={`${index}-${partIndex}`} style={{ color: part.color }}>
                    {part.text}
                  </Text>
                ))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.codeBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: space.sm,
    overflow: 'hidden',
  },
  lang: {
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  body: {
    padding: space.md,
    paddingTop: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  gutter: {
    width: 22,
    color: colors.textDim,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: colors.codeText,
  },
});
