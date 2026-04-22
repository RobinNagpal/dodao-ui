import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import { EtfCategoriesConfig } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, fetchJson, parseArgs, parsePositiveInt, requireAutomationSecret, requireStringArg } from './lib';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;

interface DiverseEtf {
  symbol: string;
  exchange: string;
  name: string;
  category: string | null;
  aum: string | null;
  aumNumeric: number | null;
}

interface DiverseEtfsResponse {
  groupKey: string;
  groupName: string;
  categories: string[];
  etfs: DiverseEtf[];
}

export interface SampledEtf {
  symbol: string;
  exchange: string;
  name: string;
  group: string;
  groupName: string;
  category: string;
  aum: string | null;
  aumNumeric: number | null;
}

function pickTwoDifferent(etfs: DiverseEtf[]): DiverseEtf[] {
  if (etfs.length === 0) return [];
  if (etfs.length === 1) return [etfs[0]];

  const first = etfs[0];
  const firstCat = first.category ?? '(unknown)';
  const firstAum = first.aumNumeric ?? 0;

  // Prefer a second pick with a different category.
  const differentCategory = etfs.slice(1).find((e) => (e.category ?? '(unknown)') !== firstCat);
  if (differentCategory) return [first, differentCategory];

  // Otherwise take one with materially different AUM (>= 3x smaller or larger).
  const differentAum = etfs.slice(1).find((e) => {
    const a = e.aumNumeric ?? 0;
    if (firstAum === 0 || a === 0) return false;
    const ratio = firstAum > a ? firstAum / a : a / firstAum;
    return ratio >= 3;
  });
  if (differentAum) return [first, differentAum];

  // Fallback: just the next one in the list.
  return [first, etfs[1]];
}

async function fetchDiverseForGroup(groupKey: string, limit: number): Promise<DiverseEtfsResponse> {
  const url = `/api/${SPACE_ID}/etfs-v1/groups/${encodeURIComponent(groupKey)}/diverse-etfs?limit=${limit}`;
  return fetchJson<DiverseEtfsResponse>(url, { authToken: true });
}

export async function sampleEtfs(opts: { perGroup: number; onlyGroup?: string; poolSize?: number }): Promise<SampledEtf[]> {
  requireAutomationSecret();
  const result: SampledEtf[] = [];
  const poolSize = opts.poolSize ?? Math.max(10, opts.perGroup * 5);

  const groups = opts.onlyGroup ? categoriesConfig.groups.filter((g) => g.key === opts.onlyGroup) : categoriesConfig.groups;

  if (opts.onlyGroup && groups.length === 0) {
    throw new Error(`Unknown group key "${opts.onlyGroup}". Valid: ${categoriesConfig.groups.map((g) => g.key).join(', ')}`);
  }

  for (const group of groups) {
    const resp = await fetchDiverseForGroup(group.key, poolSize);
    const picks = opts.perGroup === 2 ? pickTwoDifferent(resp.etfs) : resp.etfs.slice(0, opts.perGroup);

    if (picks.length < opts.perGroup) {
      console.warn(`⚠️  Only found ${picks.length}/${opts.perGroup} ETFs with a category for group "${group.key}"`);
    }

    for (const etf of picks) {
      result.push({
        symbol: etf.symbol,
        exchange: etf.exchange,
        name: etf.name,
        group: group.key,
        groupName: resp.groupName,
        category: etf.category ?? '(unknown)',
        aum: etf.aum,
        aumNumeric: etf.aumNumeric,
      });
    }
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const perGroup = parsePositiveInt(args['per-group']) ?? 2;
  const poolSize = parsePositiveInt(args['pool-size']);
  const onlyGroup = typeof args['group'] === 'string' ? args['group'] : undefined;
  const outPath = requireStringArg(args, 'out');

  const sampled = await sampleEtfs({ perGroup, onlyGroup, poolSize });
  const json = JSON.stringify(sampled, null, 2);

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, json, 'utf-8');
  console.log(`Wrote ${sampled.length} ETFs across ${new Set(sampled.map((e) => e.group)).size} groups → ${outPath}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
