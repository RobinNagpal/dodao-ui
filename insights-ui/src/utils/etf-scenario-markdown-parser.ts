import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { isExchange, SupportedCountries, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';

export interface ParsedScenarioLink {
  symbol: string;
  // Optional: only set when the markdown qualifies the ticker as
  // `EXCHANGE:SYMBOL`. Legacy ETF docs use bare symbols and leave this null —
  // the API now requires exchange on links, so admins should re-author those
  // docs (or add the links via the admin UI which has an exchange dropdown).
  exchange: string | null;
  role: 'WINNER' | 'LOSER' | 'MOST_EXPOSED';
  sortOrder: number;
}

export interface ParsedScenario {
  scenarioNumber: number;
  title: string;
  slug: string;
  underlyingCause: string;
  historicalAnalog: string;
  winnersMarkdown: string;
  losersMarkdown: string;
  outlookMarkdown: string;
  direction: EtfScenarioDirection;
  timeframe: EtfScenarioTimeframe;
  probabilityBucket: EtfScenarioProbabilityBucket;
  probabilityPercentage: number | null;
  countries: SupportedCountries[];
  outlookAsOfDate: Date;
  links: ParsedScenarioLink[];
}

const TICKER_PATTERN = /\b([A-Z]{2,5})\b/g;
// Optional `EXCHANGE:SYMBOL` qualifier — admins can author Canadian / non-US
// ETF scenarios using this form so the parser knows the exchange. When the
// qualifier is present, it overrides the bare-symbol extraction for that
// ticker. See QUALIFIED_TICKER_PATTERN in stock-scenario-markdown-parser.ts.
const QUALIFIED_TICKER_PATTERN = /\b([A-Z]{2,10}):([A-Z0-9.\-]{1,10})\b/g;
const STOPWORDS = new Set(['AI', 'US', 'EV', 'DOJ', 'OPEC', 'FERC', 'PPA', 'PMI', 'TTM', 'PPE', 'GDP', 'EPS', 'PE', 'ETF', 'ETFs', 'EM', 'CPI', 'MLP', 'MLPs']);

interface ExtractedTicker {
  symbol: string;
  exchange: string | null;
}

function extractTickers(line: string): ExtractedTicker[] {
  const out: ExtractedTicker[] = [];
  const seen = new Set<string>();

  // Pass 1: pick up qualified `EXCHANGE:SYMBOL` tokens so they're preferred
  // over a bare match that would extract just the SYMBOL part.
  for (const m of line.matchAll(QUALIFIED_TICKER_PATTERN)) {
    const exchange = m[1];
    const symbol = m[2];
    if (!isExchange(exchange)) continue;
    if (seen.has(symbol)) continue;
    seen.add(symbol);
    out.push({ symbol, exchange });
  }

  // Pass 2: bare-symbol fallback for legacy docs (no exchange qualifier).
  for (const m of line.matchAll(TICKER_PATTERN)) {
    const t = m[1];
    if (STOPWORDS.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push({ symbol: t, exchange: null });
  }
  return out;
}

function classifyProbabilityBucket(outlook: string, extractedPercentage: number | null): EtfScenarioProbabilityBucket {
  if (extractedPercentage !== null) {
    if (extractedPercentage > 40) return 'HIGH';
    if (extractedPercentage >= 20) return 'MEDIUM';
    return 'LOW';
  }
  const lower = outlook.toLowerCase();
  if (/\bhigh probability\b/i.test(outlook)) return 'HIGH';
  if (/\bmedium probability\b/i.test(outlook)) return 'MEDIUM';
  if (/\blow probability\b/i.test(outlook)) return 'LOW';
  if (/>\s*40\s*%|above 40\s*%/.test(lower)) return 'HIGH';
  if (/20\s*[–-]\s*40\s*%|20\s*-\s*40\s*%/.test(lower)) return 'MEDIUM';
  if (/<\s*20\s*%|below 20\s*%/.test(lower)) return 'LOW';
  return 'MEDIUM';
}

function classifyTimeframe(outlook: string): EtfScenarioTimeframe {
  if (/already (happened|absorbed|priced|played)/i.test(outlook) || /played out in full|fully played out/i.test(outlook)) return 'PAST';
  if (/in progress|late-stage|currently (ongoing|underway)|ongoing/i.test(outlook)) return 'IN_PROGRESS';
  return 'FUTURE';
}

function classifyDirection(title: string, winners: string, losers: string): EtfScenarioDirection {
  const lowerTitle = title.toLowerCase();
  const UPSIDE_KEYWORDS = ['boom', 'rally', 'surge', 'breakout', 'outperform', 'bull run'];
  const DOWNSIDE_KEYWORDS = ['crash', 'crisis', 'shock', 'rout', 'stagnation', 'collapse', 'bust', 'selloff', 'sell-off', 'downturn', 'contagion'];

  for (const kw of DOWNSIDE_KEYWORDS) {
    if (lowerTitle.includes(kw)) return 'DOWNSIDE';
  }
  for (const kw of UPSIDE_KEYWORDS) {
    if (lowerTitle.includes(kw)) return 'UPSIDE';
  }

  // Fallback: compare density of tickers; more losers → downside scenario.
  const winnersCount = (winners.match(TICKER_PATTERN) ?? []).length;
  const losersCount = (losers.match(TICKER_PATTERN) ?? []).length;
  if (losersCount > winnersCount + 2) return 'DOWNSIDE';
  if (winnersCount > losersCount + 2) return 'UPSIDE';
  return 'DOWNSIDE';
}

/** Pulls the first explicit probability percentage out of an outlook block.
 *  Accepts forms like `~30-35%`, `(~30–35%)`, `45%`, `>40%`, `<20%`. Returns
 *  the midpoint of a range, the single value, or null if nothing parseable.
 */
function extractProbabilityPercentage(outlook: string): number | null {
  const rangeMatch = outlook.match(/~?\s*(\d{1,3})\s*[-–]\s*(\d{1,3})\s*%/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    return Math.round((a + b) / 2);
  }
  const pointMatch = outlook.match(/~?\s*(\d{1,3})\s*%/);
  if (pointMatch) return parseInt(pointMatch[1], 10);
  return null;
}

function extractOutlookDate(text: string): Date | null {
  const m = text.match(/as of\s+(\d{4}-\d{2}-\d{2})/i);
  if (!m) return null;
  const d = new Date(m[1]);
  return isNaN(d.getTime()) ? null : d;
}

function extractField(block: string, label: string): string {
  const re = new RegExp(`\\*\\*${label}[^*]*?\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
  const match = block.match(re);
  return match ? match[1].trim() : '';
}

/**
 * Parse a `Countries:` line into a SupportedCountries[]. Returns an empty
 * array when nothing parseable is found; callers fall back to ['US'] for
 * historical ETF docs that pre-date this field.
 */
function extractCountries(block: string): SupportedCountries[] {
  const m = block.match(/\*\*Countries[^*]*?\*\*:?\s*([^\n]+)/i);
  if (!m) return [];
  const parts = m[1].split(/[,;]/).map((p) => p.trim());
  const out: SupportedCountries[] = [];
  const seen = new Set<SupportedCountries>();
  for (const p of parts) {
    const c = toSupportedCountry(p);
    if (c && !seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/** Parses the scenarios markdown document into a structured array. */
export function parseScenariosMarkdown(raw: string, fallbackOutlookDate: Date): ParsedScenario[] {
  const scenarios: ParsedScenario[] = [];

  // Split on --- (horizontal rules). Skip empty chunks and the preamble.
  const chunks = raw.split(/\n-{3,}\n/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Scenario heading looks like "### 1. Technology Sector Stagnation / Crash"
    const headingMatch = trimmed.match(/^###\s+(\d+)\.\s+(.+?)\s*$/m);
    if (!headingMatch) continue;

    const scenarioNumber = parseInt(headingMatch[1], 10);
    const title = headingMatch[2].trim();

    const bodyStart = trimmed.indexOf('\n', trimmed.indexOf(headingMatch[0])) + 1;
    const body = trimmed.slice(bodyStart).trim();

    const underlyingCause = extractField(body, 'Underlying cause');
    const historicalAnalog = extractField(body, 'Historical analog');
    const winnersMarkdown = extractField(body, 'Winners');
    const losersMarkdown = extractField(body, 'Losers');
    const outlookMarkdown = extractField(body, 'Outlook');

    if (!underlyingCause || !outlookMarkdown) continue;

    const probabilityPercentage = extractProbabilityPercentage(outlookMarkdown);
    const probabilityBucket = classifyProbabilityBucket(outlookMarkdown, probabilityPercentage);
    const timeframe = classifyTimeframe(outlookMarkdown);
    const direction = classifyDirection(title, winnersMarkdown, losersMarkdown);
    // **Countries:** US, Canada — admin-authored docs may live anywhere in the
    // scenario body. Fall back to ['US'] so legacy docs without the line still
    // parse (every existing ETF scenario was authored US-only before this).
    const parsedCountries = extractCountries(body);
    const countries: SupportedCountries[] = parsedCountries.length ? parsedCountries : [SupportedCountries.US];
    // The `as of YYYY-MM-DD` suffix lives inside the Outlook *label* (e.g. `**Outlook (as of 2026-04-19):**`),
    // which is stripped by extractField — so search the whole scenario block, not just the body.
    const outlookAsOfDate = extractOutlookDate(body) ?? extractOutlookDate(outlookMarkdown) ?? fallbackOutlookDate;

    const winnersTickers = extractTickers(winnersMarkdown);
    const losersTickers = extractTickers(losersMarkdown);

    // Try to extract the "Most exposed ETFs right now" subsection from within outlook.
    let mostExposedTickers: ExtractedTicker[] = [];
    const mostExposedMatch = outlookMarkdown.match(/\*\*Most exposed ETFs[^*]*?\*\*:?\s*([\s\S]*?)$/i);
    if (mostExposedMatch) {
      mostExposedTickers = extractTickers(mostExposedMatch[1]);
    }

    const links: ParsedScenarioLink[] = [
      ...winnersTickers.map((t, i) => ({ symbol: t.symbol, exchange: t.exchange, role: 'WINNER' as const, sortOrder: i })),
      ...losersTickers.map((t, i) => ({ symbol: t.symbol, exchange: t.exchange, role: 'LOSER' as const, sortOrder: i })),
      ...mostExposedTickers.map((t, i) => ({ symbol: t.symbol, exchange: t.exchange, role: 'MOST_EXPOSED' as const, sortOrder: i })),
    ];

    // Dedupe on (symbol, role)
    const seen = new Set<string>();
    const deduped = links.filter((l) => {
      const key = `${l.symbol}:${l.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    scenarios.push({
      scenarioNumber,
      title,
      slug: slugifyScenarioTitle(title),
      underlyingCause,
      historicalAnalog,
      winnersMarkdown,
      losersMarkdown,
      outlookMarkdown,
      direction,
      timeframe,
      probabilityBucket,
      probabilityPercentage,
      countries,
      outlookAsOfDate,
      links: deduped,
    });
  }

  return scenarios;
}
