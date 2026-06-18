import headingsData from '@/stock-analysis/stock-section-headings.json';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';

/**
 * Sections that get a per-ticker dynamic heading + intro. The 5 analysis
 * categories use the `TickerAnalysisCategory` enum; "Competition" is a special
 * additional section that lives on the main detail page but isn't part of the
 * factor-driven analysis result, so we key it separately.
 */
export type StockSectionKey = TickerAnalysisCategory | 'Competition';

type SectionContent = Readonly<{
  headings: readonly string[];
  intros: readonly string[];
  factorIntroTemplate: string;
}>;

const SECTION_CONTENT: Readonly<Record<StockSectionKey, SectionContent>> = headingsData.sections as Readonly<Record<StockSectionKey, SectionContent>>;

/**
 * Deterministic 32-bit string hash (djb2 variant). Same input → same output
 * across every server render and every crawl, which is what we want: a given
 * ticker (e.g. AAPL) always picks the same heading variant so Google sees a
 * stable page, while a different ticker (MSFT) picks a different variant so
 * the corpus of ~9k pages has more headline diversity.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickVariant<T>(variants: readonly T[], seed: string, salt: string): T {
  const idx = hashString(`${seed}|${salt}`) % variants.length;
  return variants[idx];
}

const NAME_PLACEHOLDER = /\{name\}/g;
const SYMBOL_PLACEHOLDER = /\{symbol\}/g;
const FACTOR_LIST_PLACEHOLDER = /\{factorList\}/g;
const COMPETITOR_LIST_PLACEHOLDER = /\{competitorList\}/g;
const COMPETITOR_LIST_TOKEN = '{competitorList}';

function fill(template: string, name: string, symbol: string, factorList?: string, competitorList?: string): string {
  return template
    .replace(NAME_PLACEHOLDER, name)
    .replace(SYMBOL_PLACEHOLDER, symbol)
    .replace(FACTOR_LIST_PLACEHOLDER, factorList ?? '')
    .replace(COMPETITOR_LIST_PLACEHOLDER, competitorList ?? '');
}

function joinList(items: readonly string[]): string {
  const cleaned = items.filter((t) => t.trim().length > 0);
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(', ')}, and ${cleaned[cleaned.length - 1]}`;
}

/**
 * Pick the deterministic-by-seed intro, but if that variant references a
 * placeholder we can't fill (e.g. `{competitorList}` when no competitor
 * symbols are available), walk forward through the list until we find one
 * whose required placeholders are all satisfied. Falls back to the first
 * variant if no candidate is fillable (shouldn't happen in practice).
 */
function pickFillableIntro(intros: readonly string[], seed: string, salt: string, hasCompetitorList: boolean): string {
  const start = hashString(`${seed}|${salt}`) % intros.length;
  for (let i = 0; i < intros.length; i += 1) {
    const candidate = intros[(start + i) % intros.length];
    if (!hasCompetitorList && candidate.includes(COMPETITOR_LIST_TOKEN)) continue;
    return candidate;
  }
  return intros[start];
}

export interface StockSectionCopy {
  heading: string;
  introLine: string;
  factorLine: string | null;
}

export interface GetStockSectionCopyOptions {
  factorTitles?: readonly string[];
  competitorSymbols?: readonly string[];
}

/**
 * Build per-ticker section copy: a question-style heading that embeds the
 * company name/symbol, a one-line intro describing what the section evaluates,
 * and (when factor titles are available) a second line listing the factors
 * used to score this ticker. Variant pick is seeded by `symbol + sectionKey`
 * so each ticker carries a consistent set of variants across its sections.
 */
export function getStockSectionCopy(
  sectionKey: StockSectionKey,
  symbol: string,
  companyName: string,
  options: GetStockSectionCopyOptions = {}
): StockSectionCopy {
  const { factorTitles = [], competitorSymbols = [] } = options;
  const content = SECTION_CONTENT[sectionKey];
  const name = companyName || symbol;
  const upperSymbol = symbol.toUpperCase();

  const headingTemplate = pickVariant(content.headings, upperSymbol, `${sectionKey}:heading`);

  const competitorList = joinList(competitorSymbols.slice(0, 3).map((s) => s.toUpperCase()));
  const introTemplate = pickFillableIntro(content.intros, upperSymbol, `${sectionKey}:intro`, competitorList.length > 0);

  const factorList = joinList(factorTitles);
  const factorLine = content.factorIntroTemplate && factorList ? fill(content.factorIntroTemplate, name, upperSymbol, factorList) : null;

  return {
    heading: fill(headingTemplate, name, upperSymbol),
    introLine: fill(introTemplate, name, upperSymbol, undefined, competitorList),
    factorLine,
  };
}
