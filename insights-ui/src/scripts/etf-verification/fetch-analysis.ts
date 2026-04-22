import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EtfAnalysisCategory } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, fetchJson, parseArgs, requireStringArg } from './lib';
import type { SampledEtf } from './sample-etfs';

interface FactorResult {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: string;
}

interface CategoryAnalysis {
  categoryKey: string;
  summary: string;
  overallAnalysisDetails: string;
  factorResults: FactorResult[];
}

interface AnalysisResponse {
  categories: CategoryAnalysis[];
}

const CATEGORY_TITLES: Record<string, string> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: 'Performance & Returns',
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: 'Cost, Efficiency & Team',
  [EtfAnalysisCategory.RiskAnalysis]: 'Risk Analysis',
  [EtfAnalysisCategory.FuturePerformanceOutlook]: 'Future Performance Outlook',
};

interface RenderEtf {
  symbol: string;
  exchange: string;
  group: string;
  groupName: string;
  morCategory: string;
}

function renderReport(etf: RenderEtf, analysis: AnalysisResponse): string {
  const lines: string[] = [];
  lines.push(`# ETF Report — ${etf.exchange}/${etf.symbol}`);
  lines.push('');
  lines.push(`- **Group:** ${etf.groupName} (\`${etf.group}\`)`);
  lines.push(`- **Morningstar category:** ${etf.morCategory}`);
  lines.push('');

  if (analysis.categories.length === 0) {
    lines.push('_No category analyses found for this ETF._');
    return lines.join('\n');
  }

  for (const cat of analysis.categories) {
    const title = CATEGORY_TITLES[cat.categoryKey] ?? cat.categoryKey;
    lines.push(`## ${title}`);
    lines.push('');
    if (cat.summary) {
      lines.push('### Summary');
      lines.push('');
      lines.push(cat.summary);
      lines.push('');
    }
    if (cat.overallAnalysisDetails) {
      lines.push('### Overall analysis');
      lines.push('');
      lines.push(cat.overallAnalysisDetails);
      lines.push('');
    }
    if (cat.factorResults.length > 0) {
      lines.push('### Factor results');
      lines.push('');
      for (const f of cat.factorResults) {
        lines.push(`#### \`${f.factorKey}\` — ${f.result}`);
        lines.push('');
        if (f.oneLineExplanation) {
          lines.push(`_${f.oneLineExplanation}_`);
          lines.push('');
        }
        if (f.detailedExplanation) {
          lines.push(f.detailedExplanation);
          lines.push('');
        }
      }
    }
  }

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inPath = requireStringArg(args, 'in');
  const outDir = requireStringArg(args, 'out-dir');

  const raw = JSON.parse(await readFile(inPath, 'utf-8')) as Partial<SampledEtf>[];
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('--in must be a non-empty JSON array of sampled ETFs (with at least {symbol, exchange})');
  }

  await mkdir(outDir, { recursive: true });

  let ok = 0;
  let fail = 0;
  const perGroupIndex: Record<string, string[]> = {};

  for (const entry of raw) {
    if (!entry.symbol || !entry.exchange) {
      fail++;
      console.error(`❌ Input entry missing symbol or exchange: ${JSON.stringify(entry)}`);
      continue;
    }
    const etf: RenderEtf = {
      symbol: entry.symbol,
      exchange: entry.exchange,
      group: entry.group ?? 'ungrouped',
      groupName: entry.groupName ?? entry.group ?? '(unknown group)',
      morCategory: entry.morCategory ?? '(unknown category)',
    };
    try {
      const analysis = await fetchJson<AnalysisResponse>(`/api/${SPACE_ID}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/analysis`);
      const report = renderReport(etf, analysis);
      const groupDir = path.join(outDir, etf.group);
      await mkdir(groupDir, { recursive: true });
      const filePath = path.join(groupDir, `${etf.symbol}.md`);
      await writeFile(filePath, report, 'utf-8');
      perGroupIndex[etf.group] = perGroupIndex[etf.group] ?? [];
      perGroupIndex[etf.group].push(`${etf.symbol} (${etf.morCategory})`);
      ok++;
      console.log(`✅ ${etf.exchange}/${etf.symbol} → ${filePath}`);
    } catch (err) {
      fail++;
      console.error(`❌ ${etf.exchange}/${etf.symbol} — ${(err as Error).message}`);
    }
  }

  const indexLines: string[] = ['# ETF analysis snapshot', ''];
  for (const [group, symbols] of Object.entries(perGroupIndex)) {
    indexLines.push(`## ${group}`);
    indexLines.push('');
    for (const sym of symbols) indexLines.push(`- ${sym}`);
    indexLines.push('');
  }
  await writeFile(path.join(outDir, 'index.md'), indexLines.join('\n'), 'utf-8');

  console.log(`\nDone — ${ok} succeeded, ${fail} failed. Reports in ${outDir}`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
