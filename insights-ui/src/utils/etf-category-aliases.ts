import aliasesRaw from '@/etf-analysis-data/etf-category-aliases.json';

interface EtfCategoryAliasesConfig {
  description?: string;
  aliases: Record<string, string>;
}

const ALIAS_MAP: Readonly<Record<string, string>> = (aliasesRaw as EtfCategoryAliasesConfig).aliases;

export function canonicalizeCategory(raw: string): string {
  return ALIAS_MAP[raw] ?? raw;
}

export function expandCategoryAliases(inputs: readonly string[]): string[] {
  const canonicals = new Set<string>();
  for (const input of inputs) {
    canonicals.add(ALIAS_MAP[input] ?? input);
  }
  const result = new Set<string>(canonicals);
  for (const [raw, canonical] of Object.entries(ALIAS_MAP)) {
    if (canonicals.has(canonical)) result.add(raw);
  }
  return Array.from(result);
}

export function getCategoryAliasMap(): Readonly<Record<string, string>> {
  return ALIAS_MAP;
}
