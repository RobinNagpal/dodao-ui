import { EtfScenarioDirection, EtfScenarioProbabilityBucket, EtfScenarioTimeframe } from '@/types/etfScenarioEnums';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { AllEtfExchanges, ETF_EXCHANGE_TO_COUNTRY, EtfSupportedCountry, isEtfExchange } from '@/utils/etfCountryExchangeUtils';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';

export interface ParsedScenarioLink {
  symbol: string;
  // Optional: only set when the markdown qualifies the ticker as
  // `EXCHANGE:SYMBOL`. Legacy ETF docs use bare symbols and leave this null —
  // the API now requires exchange on links, so admins should re-author those
  // docs (or add the links via the admin UI which has an exchange dropdown).
  exchange: string | null;
  role: 'WINNER' | 'LOSER';
  sortOrder: number;
  // Per-link enrichment, populated only when the markdown uses bullet form
  // (`- **EXCHANGE:SYMBOL** (+12%, 24–36 months) — explanation`). Inline /
  // bare-symbol forms leave these null. Mirrors the stock-scenario parser
  // shape, minus pricedInBucket which the ETF link schema does not store.
  expectedPriceChange: number | null;
  expectedPriceChangeExplanation: string | null;
  roleExplanation: string | null;
}

export interface ParsedScenario {
  scenarioNumber: number;
  title: string;
  slug: string;
  underlyingCause: string;
  historicalAnalog: string;
  outlookMarkdown: string;
  detailedAnalysis: string | null;
  direction: EtfScenarioDirection;
  timeframe: EtfScenarioTimeframe;
  probabilityBucket: EtfScenarioProbabilityBucket;
  probabilityPercentage: number | null;
  outlookAsOfDate: Date;
  countries: EtfSupportedCountry[];
  links: ParsedScenarioLink[];
}

const TICKER_PATTERN = /\b([A-Z]{2,5})\b/g;
// Optional `EXCHANGE:SYMBOL` qualifier — admins can author Canadian / non-US
// ETF scenarios using this form so the parser knows the exchange. When the
// qualifier is present, it overrides the bare-symbol extraction for that
// ticker. See QUALIFIED_TICKER_PATTERN in stock-scenario-markdown-parser.ts.
const QUALIFIED_TICKER_PATTERN = /\b([A-Z]{2,10}):([A-Z0-9.\-]{1,10})\b/g;
const STOPWORDS = new Set(['AI', 'US', 'EV', 'DOJ', 'OPEC', 'FERC', 'PPA', 'PMI', 'TTM', 'PPE', 'GDP', 'EPS', 'PE', 'ETF', 'ETFs', 'EM', 'CPI', 'MLP', 'MLPs']);

// Per-ETF bullet line. Captures (in order): exchange, symbol, signed price
// change %, free-text price-change explanation (timeframe + rationale), and
// the role explanation that follows the em-dash (or `-` / `:`) separator.
// All fields after the bold ticker are optional; if a section uses bullets
// without numbers, the price-change fields stay null. Mirrors the
// stock-scenario parser BULLET_LINE_PATTERN.
const BULLET_LINE_PATTERN = /^-\s*\*\*([A-Z]{2,10}):([A-Z0-9.\-]{1,10})\*\*\s*(?:\(\s*([+-]?\d{1,3})\s*%(?:\s*,\s*([^)]*?))?\s*\))?\s*(?:[—\-:]\s*(.+))?$/;

interface ExtractedTicker {
  symbol: string;
  exchange: string | null;
}

function extractTickers(line: string): ExtractedTicker[] {
  const out: ExtractedTicker[] = [];
  const seen = new Set<string>();

  // Pass 1: pick up qualified `EXCHANGE:SYMBOL` tokens so they're preferred
  // over a bare match that would extract just the SYMBOL part. Only ETF
  // exchanges qualify — `isEtfExchange` rejects stock-only venues.
  for (const m of line.matchAll(QUALIFIED_TICKER_PATTERN)) {
    const exchange = m[1];
    const symbol = m[2];
    if (!isEtfExchange(exchange)) continue;
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

type LinkRole = ParsedScenarioLink['role'];

// Walk a bulleted section line by line, extracting one ParsedScenarioLink per
// `- **EXCHANGE:SYMBOL** (...)` row. Designed for the richer authoring style
// where each ETF gets a dedicated bullet with price target + explanation;
// returns [] for inline / paragraph-style sections so callers can fall back.
function extractBulletLinks(section: string, role: LinkRole): ParsedScenarioLink[] {
  const links: ParsedScenarioLink[] = [];
  const seen = new Set<string>();
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    const m = line.match(BULLET_LINE_PATTERN);
    if (!m) continue;
    const exchange = m[1];
    if (!isEtfExchange(exchange)) continue;
    const symbol = m[2];
    const key = `${symbol}|${exchange}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let expectedPriceChange: number | null = null;
    if (m[3] !== undefined) {
      const v = parseInt(m[3], 10);
      if (!Number.isNaN(v) && v >= -100 && v <= 100) expectedPriceChange = v;
    }
    const expectedPriceChangeExplanation = m[4]?.trim() || null;
    const roleExplanation = m[5]?.trim() || null;

    links.push({
      symbol,
      exchange,
      role,
      sortOrder: links.length,
      expectedPriceChange,
      expectedPriceChangeExplanation,
      roleExplanation,
    });
  }
  return links;
}

// Bullet form (one ETF per line, supports per-link price target and rationale)
// is the preferred format. Inline / paragraph form (`KARS — cleanest…; LIT —
// …`) still works for short sections but cannot carry the per-link price
// fields. Bullet form takes precedence when both appear in the same section.
function extractRoleLinks(section: string, role: LinkRole): ParsedScenarioLink[] {
  const bulletLinks = extractBulletLinks(section, role);
  if (bulletLinks.length > 0) return bulletLinks;
  return extractTickers(section).map((t, i) => ({
    symbol: t.symbol,
    exchange: t.exchange,
    role,
    sortOrder: i,
    expectedPriceChange: null,
    expectedPriceChangeExplanation: null,
    roleExplanation: null,
  }));
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
    // The `as of YYYY-MM-DD` suffix lives inside the Outlook *label* (e.g. `**Outlook (as of 2026-04-19):**`),
    // which is stripped by extractField — so search the whole scenario block, not just the body.
    const outlookAsOfDate = extractOutlookDate(body) ?? extractOutlookDate(outlookMarkdown) ?? fallbackOutlookDate;

    const winnerLinks = extractRoleLinks(winnersMarkdown, 'WINNER');
    const loserLinks = extractRoleLinks(losersMarkdown, 'LOSER');

    const links: ParsedScenarioLink[] = [...winnerLinks, ...loserLinks];

    // Dedupe on (symbol, role)
    const seen = new Set<string>();
    const deduped = links.filter((l) => {
      const key = `${l.symbol}:${l.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Derive scenario.countries from the qualified link exchanges. Bare-symbol
    // links contribute nothing here; if every link is bare we default to US so
    // legacy docs (which were authored US-only) keep importing.
    const derivedCountries = new Set<EtfSupportedCountry>();
    for (const l of deduped) {
      if (!l.exchange) continue;
      if (!isEtfExchange(l.exchange)) continue;
      derivedCountries.add(ETF_EXCHANGE_TO_COUNTRY[l.exchange as AllEtfExchanges]);
    }
    const countries: EtfSupportedCountry[] = derivedCountries.size > 0 ? Array.from(derivedCountries) : [SupportedCountries.US];

    const detailedAnalysisMarkdown = extractField(body, 'Detailed analysis') || null;

    scenarios.push({
      scenarioNumber,
      title,
      slug: slugifyScenarioTitle(title),
      underlyingCause,
      historicalAnalog,
      outlookMarkdown,
      detailedAnalysis: detailedAnalysisMarkdown,
      direction,
      timeframe,
      probabilityBucket,
      probabilityPercentage,
      outlookAsOfDate,
      countries,
      links: deduped,
    });
  }

  return scenarios;
}
