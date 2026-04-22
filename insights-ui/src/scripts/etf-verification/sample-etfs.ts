import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib';

interface FamousEtf {
  symbol: string;
  name: string;
  exchange: string;
  category: string;
}

interface FamousGroup {
  key: string;
  name: string;
  etfs: FamousEtf[];
}

interface FamousFile {
  description: string;
  groups: FamousGroup[];
}

export interface SampledEtf {
  symbol: string;
  exchange: string;
  name: string;
  group: string;
  groupName: string;
  morCategory: string;
}

async function loadFamousFile(): Promise<FamousFile> {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../etf-analysis-data/most-famous-etfs-by-group.json');
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as FamousFile;
}

export async function sampleEtfs(opts: { perGroup?: number; onlyGroup?: string }): Promise<SampledEtf[]> {
  const file = await loadFamousFile();
  const result: SampledEtf[] = [];
  for (const group of file.groups) {
    if (opts.onlyGroup && group.key !== opts.onlyGroup) continue;
    const take = opts.perGroup !== undefined ? Math.min(opts.perGroup, group.etfs.length) : group.etfs.length;
    for (const etf of group.etfs.slice(0, take)) {
      result.push({
        symbol: etf.symbol,
        exchange: etf.exchange,
        name: etf.name,
        group: group.key,
        groupName: group.name,
        morCategory: etf.category,
      });
    }
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const perGroupRaw = args['per-group'];
  const perGroup = typeof perGroupRaw === 'string' ? parseInt(perGroupRaw, 10) : undefined;
  const onlyGroup = typeof args['group'] === 'string' ? args['group'] : undefined;
  const outPath = typeof args['out'] === 'string' ? args['out'] : undefined;

  const sampled = await sampleEtfs({ perGroup, onlyGroup });
  const json = JSON.stringify(sampled, null, 2);

  if (outPath) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, json, 'utf-8');
    console.log(`Wrote ${sampled.length} ETFs across ${new Set(sampled.map((e) => e.group)).size} groups → ${outPath}`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
