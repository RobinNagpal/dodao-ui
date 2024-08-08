import { MutationAskChatCompletionAiArgs, OpenAiChatCompletionResponse } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationAskChatCompletionAiArgs & { retryCount?: number } = await req.json();
  const completion = await askChatCompletionAI(args);

  return NextResponse.json({ completion }, { status: 200 });
}

async function askChatCompletionAI(args: MutationAskChatCompletionAiArgs & { retryCount?: number }): Promise<OpenAiChatCompletionResponse> {
  const createCompletionRequest: ChatCompletionCreateParamsNonStreaming = {
    model: args.input.model || 'gpt-3.5-turbo',
    messages: args.input.messages,
    temperature: args.input.temperature || 0.4,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    n: args.input.n || 1,
  };

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create(createCompletionRequest, { timeout: 5 * 60 * 1000 });

  return completion;
}

export const POST = withErrorHandling(postHandler);
