import { parseNumericStringValue } from '@/utils/etf-filter-utils';

/**
 * Format an AUM/sharesOut-style display string into a compact representation
 * (B/M/K), preserving a leading "$" if present. Returns "N/A" when the value
 * cannot be parsed.
 */
export function formatCompactAmount(value: string | null | undefined): string {
  const n = parseNumericStringValue(value ?? null);
  if (n === null) return 'N/A';
  const prefix = (value ?? '').trim().startsWith('$') ? '$' : '';
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(2)}K`;
  return `${prefix}${n.toFixed(2)}`;
}

/**
 * Same as formatCompactAmount but always strips any "$" prefix.
 */
export function formatCompactMillions(value: string | null | undefined): string {
  const n = parseNumericStringValue(value ?? null);
  if (n === null) return 'N/A';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return `${n.toFixed(2)}`;
}

/**
 * Split a markdown string into paragraph blocks separated by blank lines.
 * Trims and drops empty entries. Preserves intra-paragraph line breaks.
 */
export function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Split markdown into "head" and "tail" pieces. The head receives the first
 * `headCount` paragraphs; the tail receives everything after that. When there
 * are fewer paragraphs than `headCount`, the head gets all and the tail is
 * empty.
 */
export function splitMarkdownAtParagraph(markdown: string | null | undefined, headCount: number): { head: string; tail: string } {
  if (!markdown || !markdown.trim()) return { head: '', tail: '' };
  const paragraphs = splitMarkdownParagraphs(markdown);
  if (paragraphs.length <= headCount) return { head: paragraphs.join('\n\n'), tail: '' };
  return {
    head: paragraphs.slice(0, headCount).join('\n\n'),
    tail: paragraphs.slice(headCount).join('\n\n'),
  };
}
