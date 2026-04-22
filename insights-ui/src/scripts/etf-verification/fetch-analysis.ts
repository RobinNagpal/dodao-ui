import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EtfAnalysisCategory, EtfReportType, ETF_REPORT_TYPE_TO_CATEGORY } from '@/types/etf/etf-analysis-types';
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

const EVALUATION_REPORT_TYPES: readonly EtfReportType[] = [
  EtfReportType.PERFORMANCE_AND_RETURNS,
  EtfReportType.COST_EFFICIENCY_AND_TEAM,
  EtfReportType.RISK_ANALYSIS,
  EtfReportType.FUTURE_PERFORMANCE_OUTLOOK,
];

function parseCategoryArg(raw: string | undefined): EtfAnalysisCategory | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  // Accept either the EtfAnalysisCategory enum value (e.g. "PerformanceAndReturns")
  // or the EtfReportType kebab value (e.g. "performance-and-returns").
  if ((Object.values(EtfAnalysisCategory) as string[]).includes(trimmed)) {
    return trimmed as EtfAnalysisCategory;
  }
  if ((EVALUATION_REPORT_TYPES as readonly string[]).includes(trimmed)) {
    return ETF_REPORT_TYPE_TO_CATEGORY[trimmed as EtfReportType];
  }
  throw new Error(`Unknown category "${raw}". Expected one of: ${Object.values(EtfAnalysisCategory).join(', ')} or ${EVALUATION_REPORT_TYPES.join(', ')}`);
}

interface RenderEtf {
  symbol: string;
  exchange: string;
  group: string;
  groupName: string;
  category: string;
}

function renderReport(etf: RenderEtf, analysis: AnalysisResponse, onlyCategory: EtfAnalysisCategory | undefined): string {
  const lines: string[] = [];
  lines.push(`# ETF Report — ${etf.exchange}/${etf.symbol}`);
  lines.push('');
  lines.push(`- **Group:** ${etf.groupName} (\`${etf.group}\`)`);
  lines.push(`- **Category:** ${etf.category}`);
  lines.push('');

  const categories = onlyCategory ? analysis.categories.filter((c) => c.categoryKey === onlyCategory) : analysis.categories;

  if (categories.length === 0) {
    lines.push(onlyCategory ? `_No \`${onlyCategory}\` analysis found for this ETF._` : '_No category analyses found for this ETF._');
    return lines.join('\n');
  }

  for (const cat of categories) {
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
  const onlyCategory = parseCategoryArg(typeof args['category'] === 'string' ? args['category'] : undefined);

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
      category: entry.category ?? '(unknown category)',
    };
    try {
      const analysis = await fetchJson<AnalysisResponse>(`/api/${SPACE_ID}/etfs-v1/exchange/${etf.exchange}/${etf.symbol}/analysis`);
      const report = renderReport(etf, analysis, onlyCategory);
      const groupDir = path.join(outDir, etf.group);
      await mkdir(groupDir, { recursive: true });
      const filePath = path.join(groupDir, `${etf.symbol}.md`);
      await writeFile(filePath, report, 'utf-8');
      perGroupIndex[etf.group] = perGroupIndex[etf.group] ?? [];
      perGroupIndex[etf.group].push(`${etf.symbol} (${etf.category})`);
      ok++;
      console.log(`✅ ${etf.exchange}/${etf.symbol} → ${filePath}`);
    } catch (err) {
      fail++;
      console.error(`❌ ${etf.exchange}/${etf.symbol} — ${(err as Error).message}`);
    }
  }

  const indexLines: string[] = ['# ETF analysis snapshot', ''];
  if (onlyCategory) indexLines.push(`_Filtered to category: \`${onlyCategory}\`_`, '');
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
