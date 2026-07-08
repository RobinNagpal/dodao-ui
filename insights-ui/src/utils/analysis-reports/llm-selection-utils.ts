import { LLMProvider } from '@/types/llmConstants';
import { NextRequest } from 'next/server';

/** LLM provider/model chosen in the report-generation UI (both optional). */
export interface LlmSelection {
  llmProvider?: LLMProvider;
  model?: string;
}

/**
 * Reads the optional `llmProvider` / `model` the report-generation UI includes
 * in a synchronous report request body. Tolerates an empty, absent, or
 * unparseable body — returns `{}` so the route falls back to the configured
 * (env/provider) defaults in `getLLMResponseForPromptViaInvocation`.
 */
export async function parseLlmSelectionFromRequest(req: NextRequest): Promise<LlmSelection> {
  try {
    const body = (await req.json()) as LlmSelection | null;
    if (!body || typeof body !== 'object') return {};
    return { llmProvider: body.llmProvider, model: body.model };
  } catch {
    return {};
  }
}
