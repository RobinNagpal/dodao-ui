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
 * across every server render and every crawl, which is what we want — the goal
 * is for one specific ticker (e.g. AAPL) to always pick the same heading
 * variant so Google sees a stable page, while a different ticker (MSFT) picks
 * a different variant so the corpus of ~9k pages has more headline diversity.
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

function fill(template: string, name: string, symbol: string, factorList?: string): string {
  return template
    .replace(/\{name\}/g, name)
    .replace(/\{symbol\}/g, symbol)
    .replace(/\{factorList\}/g, factorList ?? '');
}

function joinFactorTitles(factorTitles: readonly string[]): string {
  const titles = factorTitles.filter((t) => t.trim().length > 0);
  if (titles.length === 0) return '';
  if (titles.length === 1) return titles[0];
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
  return `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`;
}

export interface StockSectionCopy {
  heading: string;
  introLine: string;
  factorLine: string | null;
}

/**
 * Build per-ticker section copy: a question-style heading that embeds the
 * company name/symbol, a one-line intro describing what the section evaluates,
 * and (when factor titles are available) a second line listing the factors
 * used to score this ticker. Variant pick is seeded by `symbol + sectionKey`
 * so each ticker carries a consistent set of variants across its sections.
 */
export function getStockSectionCopy(sectionKey: StockSectionKey, symbol: string, companyName: string, factorTitles: readonly string[] = []): StockSectionCopy {
  const content = SECTION_CONTENT[sectionKey];
  const name = companyName || symbol;
  const upperSymbol = symbol.toUpperCase();

  const headingTemplate = pickVariant(content.headings, upperSymbol, `${sectionKey}:heading`);
  const introTemplate = pickVariant(content.intros, upperSymbol, `${sectionKey}:intro`);

  const factorList = joinFactorTitles(factorTitles);
  const factorLine = content.factorIntroTemplate && factorList ? fill(content.factorIntroTemplate, name, upperSymbol, factorList) : null;

  return {
    heading: fill(headingTemplate, name, upperSymbol),
    introLine: fill(introTemplate, name, upperSymbol),
    factorLine,
  };
}
