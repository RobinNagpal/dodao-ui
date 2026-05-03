// Editorial convention (NOT enforced by the schema or this script):
// every stock scenario ships with EXACTLY 5 winners and 5 losers, plus
// optionally up to 5 "10 Baggers". See
// `docs/insights-ui/scenario-authoring.md` for the full convention.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStockScenariosMarkdown, ParsedStockScenario } from '@/utils/stock-scenario-markdown-parser';

// Default markdown location mirrors the ETF script layout. If the seed doc
// hasn't been created yet, point at it via `SCENARIOS_MD_PATH`.
const DEFAULT_MARKDOWN_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../docs/insights-ui/stock-analysis/stock-market-scenarios.md');

const API_BASE = (process.env.SCENARIOS_API_BASE ?? 'https://koalagains.com').replace(/\/+$/, '');
const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET ?? '';
const MARKDOWN_PATH = process.env.SCENARIOS_MD_PATH ?? DEFAULT_MARKDOWN_PATH;
const FALLBACK_DATE = new Date(process.env.SCENARIOS_FALLBACK_DATE ?? new Date().toISOString().slice(0, 10));

function toRequestBody(s: ParsedStockScenario) {
  return {
    scenarioNumber: s.scenarioNumber,
    title: s.title,
    slug: s.slug,
    underlyingCause: s.underlyingCause,
    historicalAnalog: s.historicalAnalog,
    outlookMarkdown: s.outlookMarkdown,
    direction: s.direction,
    timeframe: s.timeframe,
    probabilityBucket: s.probabilityBucket,
    probabilityPercentage: s.probabilityPercentage,
    countries: s.countries,
    outlookAsOfDate: s.outlookAsOfDate.toISOString(),
    links: s.links.map((l) => ({
      symbol: l.symbol,
      exchange: l.exchange,
      role: l.role,
      sortOrder: l.sortOrder,
      roleExplanation: l.roleExplanation,
      expectedPriceChange: l.expectedPriceChange,
      expectedPriceChangeExplanation: l.expectedPriceChangeExplanation,
      pricedInBucket: l.pricedInBucket,
    })),
  };
}

async function main() {
  if (!AUTOMATION_SECRET) {
    throw new Error('AUTOMATION_SECRET is not set — export it or source the discord-claude-bot/.env before running.');
  }

  console.log(`📄 Reading scenarios from: ${MARKDOWN_PATH}`);
  const markdown = await readFile(MARKDOWN_PATH, 'utf-8');
  const scenarios = parseStockScenariosMarkdown(markdown, FALLBACK_DATE);
  console.log(`✅ Parsed ${scenarios.length} scenarios`);

  if (scenarios.length === 0) {
    throw new Error('No scenarios parsed — check the markdown file and heading format.');
  }

  const endpoint = `${API_BASE}/api/stock-scenarios?token=${encodeURIComponent(AUTOMATION_SECRET)}`;
  console.log(`🎯 Target: ${API_BASE}/api/stock-scenarios (token elided)`);

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
