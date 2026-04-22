import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ETF_PROMPT_KEYS, EtfReportType } from '@/types/etf/etf-analysis-types';
import { SPACE_ID, fetchJson, parseArgs } from './lib';

interface PromptWithVersion {
  id: string;
  key: string;
  name: string;
  activePromptVersionId: string | null;
  activePromptVersion: {
    id: string;
    version: number;
    promptTemplate: string;
  } | null;
}

interface GetPromptsByKeysResponse {
  prompts: PromptWithVersion[];
}

const EVALUATION_PROMPT_KEYS: string[] = [
  ETF_PROMPT_KEYS[EtfReportType.PERFORMANCE_AND_RETURNS],
  ETF_PROMPT_KEYS[EtfReportType.COST_EFFICIENCY_AND_TEAM],
  ETF_PROMPT_KEYS[EtfReportType.RISK_ANALYSIS],
  ETF_PROMPT_KEYS[EtfReportType.FUTURE_PERFORMANCE_OUTLOOK],
];

function safeFileName(key: string): string {
  return key.replace(/[/:]/g, '__');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = typeof args['out-dir'] === 'string' ? args['out-dir'] : undefined;
  const onlyKey = typeof args['key'] === 'string' ? args['key'] : undefined;
  const keys = onlyKey ? [onlyKey] : EVALUATION_PROMPT_KEYS;

  const resp = await fetchJson<GetPromptsByKeysResponse>(`/api/${SPACE_ID}/prompts/by-keys?keys=${encodeURIComponent(keys.join(','))}`);
  const byKey = new Map(resp.prompts.map((p) => [p.key, p] as const));

  for (const key of keys) {
    const p = byKey.get(key);
    if (!p) {
      console.error(`❌ No prompt found for key "${key}"`);
      continue;
    }
    const version = p.activePromptVersion?.version ?? 'none';
    const template = p.activePromptVersion?.promptTemplate ?? '';
    if (outDir) {
      await mkdir(outDir, { recursive: true });
      const meta = {
        key: p.key,
        name: p.name,
        promptId: p.id,
        activeVersion: p.activePromptVersion?.version ?? null,
        activePromptVersionId: p.activePromptVersion?.id ?? null,
      };
      const metaPath = path.join(outDir, `${safeFileName(key)}.meta.json`);
      const templatePath = path.join(outDir, `${safeFileName(key)}.prompt.md`);
      await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
      await writeFile(templatePath, template, 'utf-8');
      console.log(`✅ ${key} v${version} → ${templatePath}`);
    } else {
      console.log(`\n=== ${key} (v${version}) ===`);
      console.log(template);
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
