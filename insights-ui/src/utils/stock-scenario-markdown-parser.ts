import { ScenarioDirection, ScenarioPricedInBucket, ScenarioProbabilityBucket, ScenarioRole, ScenarioTimeframe } from '@/types/scenarioEnums';
import { AllExchanges, EXCHANGE_TO_COUNTRY, isExchange, SupportedCountries, toSupportedCountry } from '@/utils/countryExchangeUtils';
import { slugifyScenarioTitle } from '@/utils/scenario-slug';

export interface ParsedStockScenarioLink {
  symbol: string;
  exchange: string;
  role: ScenarioRole;
  sortOrder: number;
  expectedPriceChange: number | null;
  expectedPriceChangeExplanation: string | null;
  roleExplanation: string | null;
  pricedInBucket: ScenarioPricedInBucket | null;
}

export interface ParsedStockScenario {
  scenarioNumber: number;
  title: string;
  slug: string;
  underlyingCause: string;
  historicalAnalog: string;
  outlookMarkdown: string;
  direction: ScenarioDirection;
  timeframe: ScenarioTimeframe;
  probabilityBucket: ScenarioProbabilityBucket;
  probabilityPercentage: number | null;
  countries: SupportedCountries[];
  outlookAsOfDate: Date;
  links: ParsedStockScenarioLink[];
}

// Stock markdown must qualify every ticker as `EXCHANGE:SYMBOL` so a parser
// can disambiguate across markets. Bare tokens are NOT extracted as tickers —
// non-US markets have too many "all caps" collisions (country codes, sector
// tags, role labels) to make heuristics reliable.
const QUALIFIED_TICKER_PATTERN = /\b([A-Z]{2,10}):([A-Z0-9.\-]{1,10})\b/g;

// Per-stock bullet line. Captures (in order): exchange, symbol, signed price
// change %, free-text price-change explanation (timeframe + rationale), and
// the role explanation that follows the em-dash (or `-` / `:`) separator.
// All fields after the bold ticker are optional; if a section uses bullets
// without numbers, the price-change fields stay null.
const BULLET_LINE_PATTERN = /^-\s*\*\*([A-Z]{2,10}):([A-Z0-9.\-]{1,10})\*\*\s*(?:\(\s*([+-]?\d{1,3})\s*%(?:\s*,\s*([^)]*?))?\s*\))?\s*(?:[—\-:]\s*(.+))?$/;

function extractQualifiedTickers(text: string): Array<{ symbol: string; exchange: string }> {
  const out: Array<{ symbol: string; exchange: string }> = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(QUALIFIED_TICKER_PATTERN)) {
    const exchange = m[1];
    const symbol = m[2];
    if (!isExchange(exchange)) continue;
    const key = `${symbol}|${exchange}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ symbol, exchange });
  }
  return out;
}

// Match priced-in phrases anywhere in a bullet's text (explanation or role
// clause). Order matters — "over-priced" must be tested before "priced" /
// "partially priced", and "not priced" before bare "priced". The matched
// phrase is stripped from the text it came from so it doesn't render twice.
const PRICED_IN_PATTERNS: Array<{ pattern: RegExp; bucket: ScenarioPricedInBucket }> = [
  { pattern: /\b(?:over[- ]?priced(?: in)?)\b/i, bucket: ScenarioPricedInBucket.OVER_PRICED_IN },
  { pattern: /\bfully priced(?: in)?\b/i, bucket: ScenarioPricedInBucket.FULLY_PRICED_IN },
  { pattern: /\bmostly priced(?: in)?\b/i, bucket: ScenarioPricedInBucket.MOSTLY_PRICED_IN },
  { pattern: /\bpartially priced(?: in)?\b/i, bucket: ScenarioPricedInBucket.PARTIALLY_PRICED_IN },
  { pattern: /\b(?:not priced(?: in)?|unpriced|no[t]? priced)\b/i, bucket: ScenarioPricedInBucket.NOT_PRICED_IN },
];

interface PricedInDetection {
  bucket: ScenarioPricedInBucket | null;
  stripped: string;
}

// Scan `text` for a priced-in phrase. Returns the matched bucket (or null) and
// the original text with the phrase removed, so it isn't rendered twice.
function detectPricedIn(text: string): PricedInDetection {
  for (const { pattern, bucket } of PRICED_IN_PATTERNS) {
    if (pattern.test(text)) {
      const stripped = text
        .replace(pattern, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*,\s*,/g, ',')
        .replace(/^[\s,;]+|[\s,;]+$/g, '');
      return { bucket, stripped };
    }
  }
  return { bucket: null, stripped: text };
}

function extractBulletLinks(section: string, role: ScenarioRole): ParsedStockScenarioLink[] {
  const links: ParsedStockScenarioLink[] = [];
  const seen = new Set<string>();
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    const m = line.match(BULLET_LINE_PATTERN);
    if (!m) continue;
    const exchange = m[1];
    if (!isExchange(exchange)) continue;
    const symbol = m[2];
    const key = `${symbol}|${exchange}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let expectedPriceChange: number | null = null;
    if (m[3] !== undefined) {
      const v = parseInt(m[3], 10);
      if (!Number.isNaN(v) && v >= -100 && v <= 100) expectedPriceChange = v;
    }

    // Priced-in phrase may live in either the parenthetical explanation or
    // the role clause. Check explanation first; fall back to role clause.
    let pricedInBucket: ScenarioPricedInBucket | null = null;
    let expectedPriceChangeExplanation = m[4]?.trim() || null;
    let roleExplanation = m[5]?.trim() || null;
    if (expectedPriceChangeExplanation) {
      const det = detectPricedIn(expectedPriceChangeExplanation);
      if (det.bucket) {
        pricedInBucket = det.bucket;
        expectedPriceChangeExplanation = det.stripped || null;
      }
    }
    if (!pricedInBucket && roleExplanation) {
      const det = detectPricedIn(roleExplanation);
      if (det.bucket) {
        pricedInBucket = det.bucket;
        roleExplanation = det.stripped || null;
      }
    }

    links.push({
      symbol,
      exchange,
      role,
      sortOrder: links.length,
      expectedPriceChange,
      expectedPriceChangeExplanation,
      roleExplanation,
      pricedInBucket,
    });
  }
  return links;
}

// Bullet form (one ticker per line, supports per-stock price target and
// rationale) is the recommended format. Inline form ("NYSE:TEVA (Teva — ...)"
// inside a paragraph) still works for short scenarios but cannot carry the
// expectedPriceChange / explanation fields. Bullet form takes precedence
// when both appear in the same section.
function extractRoleLinks(section: string, role: ScenarioRole): ParsedStockScenarioLink[] {
  const bulletLinks = extractBulletLinks(section, role);
  if (bulletLinks.length > 0) return bulletLinks;
  return extractQualifiedTickers(section).map((r, i) => ({
    ...r,
    role,
    sortOrder: i,
    expectedPriceChange: null,
    expectedPriceChangeExplanation: null,
    roleExplanation: null,
    pricedInBucket: null,
  }));
}

function classifyProbabilityBucket(outlook: string, extractedPercentage: number | null): ScenarioProbabilityBucket {
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

function classifyTimeframe(outlook: string): ScenarioTimeframe {
  if (/already (happened|absorbed|priced|played)/i.test(outlook) || /played out in full|fully played out/i.test(outlook)) return 'PAST';
  if (/in progress|late-stage|currently (ongoing|underway)|ongoing/i.test(outlook)) return 'IN_PROGRESS';
  return 'FUTURE';
}

function classifyDirection(title: string, winners: string, losers: string): ScenarioDirection {
  const lowerTitle = title.toLowerCase();
  const UPSIDE_KEYWORDS = ['boom', 'rally', 'surge', 'breakout', 'outperform', 'bull run'];
  const DOWNSIDE_KEYWORDS = ['crash', 'crisis', 'shock', 'rout', 'stagnation', 'collapse', 'bust', 'selloff', 'sell-off', 'downturn', 'contagion'];

  for (const kw of DOWNSIDE_KEYWORDS) {
    if (lowerTitle.includes(kw)) return 'DOWNSIDE';
  }
  for (const kw of UPSIDE_KEYWORDS) {
    if (lowerTitle.includes(kw)) return 'UPSIDE';
  }

  const winnersCount = (winners.match(QUALIFIED_TICKER_PATTERN) ?? []).length;
  const losersCount = (losers.match(QUALIFIED_TICKER_PATTERN) ?? []).length;
  if (losersCount > winnersCount + 2) return 'DOWNSIDE';
  if (winnersCount > losersCount + 2) return 'UPSIDE';
  return 'DOWNSIDE';
}

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
 * Parse a `Countries:` line — explicit or inside an outlook / header block —
 * into a SupportedCountries[]. Returns an empty array when nothing parseable
 * is found; callers fall back to inferring from the links' exchanges.
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

function inferCountriesFromLinks(links: ParsedStockScenarioLink[]): SupportedCountries[] {
  const seen = new Set<SupportedCountries>();
  const out: SupportedCountries[] = [];
  for (const link of links) {
    if (!isExchange(link.exchange)) continue;
    const country = EXCHANGE_TO_COUNTRY[link.exchange as AllExchanges];
    if (!seen.has(country)) {
      seen.add(country);
      out.push(country);
    }
  }
  return out;
}

/**
 * Parse the stock scenarios markdown document into a structured array. The
 * expected heading shape matches the ETF parser (`### 1. Title`), so editors
 * can copy the ETF doc conventions over.
 */
export function parseStockScenariosMarkdown(raw: string, fallbackOutlookDate: Date): ParsedStockScenario[] {
  const scenarios: ParsedStockScenario[] = [];
  const chunks = raw.split(/\n-{3,}\n/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

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
    const outlookAsOfDate = extractOutlookDate(body) ?? extractOutlookDate(outlookMarkdown) ?? fallbackOutlookDate;

    const winnerLinks = extractRoleLinks(winnersMarkdown, ScenarioRole.WINNER);
    const loserLinks = extractRoleLinks(losersMarkdown, ScenarioRole.LOSER);

    // Most exposed prefers a top-level `**Most exposed:**` section so it can
    // carry per-stock detail in bullet form. Older docs that inline it inside
    // the Outlook paragraph still parse via the legacy fallback.
    const mostExposedMarkdown = extractField(body, 'Most exposed');
    let mostExposedLinks: ParsedStockScenarioLink[] = [];
    if (mostExposedMarkdown) {
      mostExposedLinks = extractRoleLinks(mostExposedMarkdown, ScenarioRole.MOST_EXPOSED);
    }
    if (mostExposedLinks.length === 0) {
      const mostExposedMatch = outlookMarkdown.match(/\*\*Most exposed[^*]*?\*\*:?\s*([\s\S]*?)$/i);
      if (mostExposedMatch) {
        mostExposedLinks = extractRoleLinks(mostExposedMatch[1], ScenarioRole.MOST_EXPOSED);
      }
    }

    const links: ParsedStockScenarioLink[] = [...winnerLinks, ...loserLinks, ...mostExposedLinks];

    const seen = new Set<string>();
    const deduped = links.filter((l) => {
      const key = `${l.symbol}|${l.exchange}|${l.role}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const explicitCountries = extractCountries(body);
    const countries = explicitCountries.length ? explicitCountries : inferCountriesFromLinks(deduped);

    scenarios.push({
      scenarioNumber,
      title,
      slug: slugifyScenarioTitle(title),
      underlyingCause,
      historicalAnalog,
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
