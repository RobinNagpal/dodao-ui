import { MutationAskChatCompletionAiArgs, OpenAiChatCompletionResponse } from '@/graphql/generated/generated-types';

import { formatAxiosError } from '@/app/api/helpers/adapters/formatAxiosError';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationAskChatCompletionAiArgs & { retryCount?: number } = await req.json();
  const completion = await askChatCompletionAI(args);

  return NextResponse.json({ completion }, { status: 200 });
}

async function askChatCompletionAI(args: MutationAskChatCompletionAiArgs & { retryCount?: number }): Promise<OpenAiChatCompletionResponse> {
  try {
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
  } catch (error) {
    console.error(formatAxiosError(error));
    await new Promise((resolve) => setTimeout(resolve, 10000));
    if (!args.retryCount || args.retryCount < 3) {
      console.log('Retrying...');
      let retryCount = args.retryCount || 0;
      return askChatCompletionAI({ ...args, retryCount: ++retryCount });
    }

    throw error;
  }
}
