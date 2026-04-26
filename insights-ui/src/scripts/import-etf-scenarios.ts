import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseScenariosMarkdown, ParsedScenario } from '@/utils/etf-scenario-markdown-parser';

const DEFAULT_MARKDOWN_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../docs/ai-knowledge/insights-ui/etf-analysis/etf-market-scenarios.md'
);

const API_BASE = (process.env.SCENARIOS_API_BASE ?? 'https://koalagains.com').replace(/\/+$/, '');
const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET ?? '';
const MARKDOWN_PATH = process.env.SCENARIOS_MD_PATH ?? DEFAULT_MARKDOWN_PATH;
const FALLBACK_DATE = new Date(process.env.SCENARIOS_FALLBACK_DATE ?? '2026-04-19');

function toRequestBody(s: ParsedScenario) {
  return {
    scenarioNumber: s.scenarioNumber,
    title: s.title,
    slug: s.slug,
    underlyingCause: s.underlyingCause,
    historicalAnalog: s.historicalAnalog,
    winnersMarkdown: s.winnersMarkdown,
    losersMarkdown: s.losersMarkdown,
    outlookMarkdown: s.outlookMarkdown,
    direction: s.direction,
    timeframe: s.timeframe,
    probabilityBucket: s.probabilityBucket,
    probabilityPercentage: s.probabilityPercentage,
    countries: s.countries,
    outlookAsOfDate: s.outlookAsOfDate.toISOString(),
    // The API requires exchange on every link. Drop bare-symbol legacy links
    // here — they have to be re-authored with `EXCHANGE:SYMBOL` qualifiers
    // (or added through the admin UI which has an exchange dropdown).
    links: s.links.filter((l) => !!l.exchange).map((l) => ({ symbol: l.symbol, exchange: l.exchange!, role: l.role, sortOrder: l.sortOrder })),
  };
}

async function main() {
  if (!AUTOMATION_SECRET) {
    throw new Error('AUTOMATION_SECRET is not set — export it or source the discord-claude-bot/.env before running.');
  }

  console.log(`📄 Reading scenarios from: ${MARKDOWN_PATH}`);
  const markdown = await readFile(MARKDOWN_PATH, 'utf-8');
  const scenarios = parseScenariosMarkdown(markdown, FALLBACK_DATE);
  console.log(`✅ Parsed ${scenarios.length} scenarios`);

  if (scenarios.length === 0) {
    throw new Error('No scenarios parsed — check the markdown file and heading format.');
  }

  const endpoint = `${API_BASE}/api/etf-scenarios?token=${encodeURIComponent(AUTOMATION_SECRET)}`;
  console.log(`🎯 Target: ${API_BASE}/api/etf-scenarios (token elided)`);

  let ok = 0;
  let fail = 0;
  for (const scenario of scenarios) {
    const body = toRequestBody(scenario);
    const label = `#${scenario.scenarioNumber} ${scenario.title}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        fail++;
        console.error(`❌ ${label} — HTTP ${res.status}: ${text.slice(0, 400)}`);
        break;
      }
      const json = (await res.json()) as { id?: string; slug?: string };
      ok++;
      console.log(`✅ ${label} → id=${json.id ?? '?'} slug=${json.slug ?? '?'}`);
    } catch (err) {
      fail++;
      console.error(`❌ ${label} — ${(err as Error).message}`);
      break;
    }
  }

  console.log(`\nDone — ${ok} succeeded, ${fail} failed, ${scenarios.length - ok - fail} skipped.`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
