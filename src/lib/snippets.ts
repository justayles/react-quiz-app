import type { Question, Snippet } from '../data/types';

export interface ExplanationCodeBlock {
  title: 'Example' | 'Fixed code';
  snippet: Snippet;
}

function collapseWhitespace(source: string): string {
  return source
    .replace(/\r\n/g, '\n')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\])])/g, '$1')
    .replace(/></g, '> <')
    .replace(/\s+/g, ' ')
    .trim();
}

function fingerprint(source: string): string {
  return collapseWhitespace(source)
    .replace(/['"`]/g, '')
    .replace(/[^\w$.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function wordOverlap(left: string, right: string): number {
  const leftWords = new Set(left.split(' ').filter(Boolean));
  const rightWords = new Set(right.split(' ').filter(Boolean));
  let intersection = 0;
  for (const word of leftWords) {
    if (rightWords.has(word)) intersection += 1;
  }
  const union = leftWords.size + rightWords.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function fingerprintContained(left: string, right: string): boolean {
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length <= right.length ? right : left;
  if (shorter.length < 20) return false;
  return (
    longer === shorter ||
    longer.startsWith(`${shorter} `) ||
    longer.endsWith(` ${shorter}`) ||
    longer.includes(` ${shorter} `)
  );
}

function hasSource(snippet: Snippet | undefined): snippet is Snippet {
  return Boolean(snippet?.source.trim());
}

/** True when two snippets are the same idea, ignoring formatting. */
export function isDuplicateSnippet(a?: string, b?: string): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  if (a === b) return true;
  const collapsedA = collapseWhitespace(a);
  const collapsedB = collapseWhitespace(b);
  if (collapsedA === collapsedB) return true;
  const left = fingerprint(a);
  const right = fingerprint(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (fingerprintContained(left, right)) return true;
  return wordOverlap(left, right) >= 0.85;
}

function visibleForm(source: string): string {
  return source.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trim();
}

function alreadyShown(source: string, prompt?: string): boolean {
  if (!prompt?.trim()) return false;
  // Keep comments: the fix is sometimes only a directive or annotation.
  return visibleForm(source) === visibleForm(prompt);
}

function pickOne(example: Snippet, fixed: Snippet): ExplanationCodeBlock {
  if (fixed.source.trim().length > example.source.trim().length) {
    return { title: 'Fixed code', snippet: fixed };
  }
  return { title: 'Example', snippet: example };
}

/** Unique code blocks to render in the See answer panel. */
export function explanationCodeBlocks(question: Question): ExplanationCodeBlock[] {
  const prompt = question.code?.source;
  const example = hasSource(question.explanation.example) ? question.explanation.example : undefined;
  const fixed = hasSource(question.explanation.fixedCode) ? question.explanation.fixedCode : undefined;
  const visibleExample = example && !alreadyShown(example.source, prompt) ? example : undefined;
  const visibleFixed = fixed && !alreadyShown(fixed.source, prompt) ? fixed : undefined;

  if (
    visibleExample &&
    visibleFixed &&
    isDuplicateSnippet(visibleExample.source, visibleFixed.source)
  ) {
    return [pickOne(visibleExample, visibleFixed)];
  }

  const blocks: ExplanationCodeBlock[] = [];
  if (visibleExample) blocks.push({ title: 'Example', snippet: visibleExample });
  if (visibleFixed) blocks.push({ title: 'Fixed code', snippet: visibleFixed });
  return blocks;
}
