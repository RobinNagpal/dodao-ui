import { EtfScenarioOutlookBucket } from '@prisma/client';
import { slugifyScenarioTitle } from '@/utils/etf-scenario-slug';

export interface ParsedScenarioLink {
  symbol: string;
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
  outlookBucket: EtfScenarioOutlookBucket;
  outlookAsOfDate: Date;
  links: ParsedScenarioLink[];
}

const TICKER_PATTERN = /\b([A-Z]{2,5})\b/g;
const STOPWORDS = new Set(['AI', 'US', 'EV', 'DOJ', 'OPEC', 'FERC', 'PPA', 'PMI', 'TTM', 'PPE', 'GDP', 'EPS', 'PE', 'ETF', 'ETFs', 'EM', 'CPI', 'MLP', 'MLPs']);

function extractTickers(line: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const matches = line.matchAll(TICKER_PATTERN);
  for (const m of matches) {
    const t = m[1];
    if (STOPWORDS.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function classifyOutlookBucket(outlook: string): EtfScenarioOutlookBucket {
  const lower = outlook.toLowerCase();
  if (/in progress|already (happened|absorbed|priced)/i.test(outlook)) return 'IN_PROGRESS';
  if (/\bhigh probability\b/i.test(outlook)) return 'HIGH';
  if (/\bmedium probability\b/i.test(outlook)) return 'MEDIUM';
  if (/\blow probability\b/i.test(outlook)) return 'LOW';
  // Fallback: try first >40%, 20-40%, <20% signals
  if (/>\s*40\s*%|above 40\s*%/.test(lower)) return 'HIGH';
  if (/20\s*[–-]\s*40\s*%|20\s*-\s*40\s*%/.test(lower)) return 'MEDIUM';
  if (/<\s*20\s*%|below 20\s*%/.test(lower)) return 'LOW';
  return 'MEDIUM';
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

    const outlookBucket = classifyOutlookBucket(outlookMarkdown);
    // The `as of YYYY-MM-DD` suffix lives inside the Outlook *label* (e.g. `**Outlook (as of 2026-04-19):**`),
    // which is stripped by extractField — so search the whole scenario block, not just the body.
    const outlookAsOfDate = extractOutlookDate(body) ?? extractOutlookDate(outlookMarkdown) ?? fallbackOutlookDate;

    const winnersTickers = extractTickers(winnersMarkdown);
    const losersTickers = extractTickers(losersMarkdown);

    // Try to extract the "Most exposed ETFs right now" subsection from within outlook.
    let mostExposedTickers: string[] = [];
    const mostExposedMatch = outlookMarkdown.match(/\*\*Most exposed ETFs[^*]*?\*\*:?\s*([\s\S]*?)$/i);
    if (mostExposedMatch) {
      mostExposedTickers = extractTickers(mostExposedMatch[1]);
    }

    const links: ParsedScenarioLink[] = [
      ...winnersTickers.map((symbol, i) => ({ symbol, role: 'WINNER' as const, sortOrder: i })),
      ...losersTickers.map((symbol, i) => ({ symbol, role: 'LOSER' as const, sortOrder: i })),
      ...mostExposedTickers.map((symbol, i) => ({ symbol, role: 'MOST_EXPOSED' as const, sortOrder: i })),
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
      outlookBucket,
      outlookAsOfDate,
      links: deduped,
    });
  }

  return scenarios;
}
