import { readFile } from 'node:fs/promises';
import { SPACE_ID, fetchJson, parseArgs, requireStringArg } from './lib';

interface PromptWithVersion {
  id: string;
  key: string;
  name: string;
}

interface GetPromptsByKeysResponse {
  prompts: PromptWithVersion[];
}

interface CreatedVersion {
  id: string;
  version: number;
  promptTemplate: string;
  commitMessage: string | null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = requireStringArg(args, 'key');
  const filePath = requireStringArg(args, 'file');
  const commitMessage = typeof args['message'] === 'string' ? args['message'] : 'ETF verification loop — automated prompt refinement';
  const createdBy = typeof args['by'] === 'string' ? args['by'] : 'etf-verification-loop';

  const template = await readFile(filePath, 'utf-8');
  if (template.trim().length === 0) {
    throw new Error(`Prompt file ${filePath} is empty — refusing to create an empty prompt version`);
  }

  const resp = await fetchJson<GetPromptsByKeysResponse>(`/api/${SPACE_ID}/prompts/by-keys?keys=${encodeURIComponent(key)}`);
  const prompt = resp.prompts.find((p) => p.key === key);
  if (!prompt) {
    throw new Error(`No prompt found for key "${key}" in space "${SPACE_ID}"`);
  }

  const created = await fetchJson<CreatedVersion>(`/api/${SPACE_ID}/prompts/${prompt.id}/versions`, {
    method: 'POST',
    body: {
      promptTemplate: template,
      commitMessage,
      createdBy,
    },
  });

  console.log(`✅ Created + activated version ${created.version} for "${key}" (prompt id: ${prompt.id})`);
  console.log(`   commitMessage: ${created.commitMessage ?? '(none)'}`);
  console.log(`   template length: ${template.length} chars`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
