import { askClaude, AskClaudeResponse } from '@/util/claude/get-claude-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const askClaudeSchema = z.object({
  question: z.string().min(1, 'question is required'),
  context: z.string().optional(),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().max(64000).optional(),
});

export type AskClaudeApiRequest = z.infer<typeof askClaudeSchema>;

async function postHandler(request: NextRequest): Promise<AskClaudeResponse> {
  const body = askClaudeSchema.parse(await request.json());
  return askClaude(body);
}

export const POST = withErrorHandlingV2<AskClaudeResponse>(postHandler);
