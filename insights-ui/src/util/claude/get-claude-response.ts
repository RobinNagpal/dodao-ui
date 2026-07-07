import type Anthropic from '@anthropic-ai/sdk';
import { getClaudeClient, getClaudeModel } from './claude-client';

export interface AskClaudeRequest {
  /** The question or instruction to send to Claude. */
  question: string;
  /**
   * Optional reference material (e.g. a report excerpt) that Claude should use
   * to ground its answer. Kept as a separate field so the caller doesn't have
   * to hand-concatenate it into the question.
   */
  context?: string;
  /** Optional system prompt override. */
  systemPrompt?: string;
  /** Upper bound on the response length. Defaults to 16000. */
  maxTokens?: number;
}

export interface AskClaudeResponse {
  /** The concatenated markdown text of Claude's answer. */
  answer: string;
  /** The model that produced the answer. */
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

const DEFAULT_SYSTEM_PROMPT =
  'You are a financial analysis assistant for KoalaGains, a value-investing insights platform. ' +
  'Answer clearly and concisely using markdown. Use headings, bullet points, and tables where they aid readability. ' +
  'Wrap all amounts, dollar values, and figures in backticks. Do not use LaTeX. ' +
  'If the provided context is insufficient to answer confidently, say so rather than inventing figures.';

/**
 * Sends a question to Claude via the official Anthropic SDK and returns the
 * markdown answer plus token usage.
 *
 * Uses adaptive thinking so Claude decides how much to reason per request, and
 * a non-streaming request bounded by `maxTokens` (default 16000, which keeps
 * the call comfortably under the SDK's HTTP timeout).
 */
export async function askClaude({ question, context, systemPrompt, maxTokens = 16000 }: AskClaudeRequest): Promise<AskClaudeResponse> {
  const trimmedQuestion = question?.trim();
  if (!trimmedQuestion) {
    throw new Error('askClaude requires a non-empty question.');
  }

  const client = getClaudeClient();
  const model = getClaudeModel();

  const userContent = context?.trim() ? `Reference context:\n\n${context.trim()}\n\n---\n\nQuestion: ${trimmedQuestion}` : trimmedQuestion;

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    system: systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Claude declined to answer this request.');
  }

  const answer = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  return {
    answer,
    model: response.model,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}
