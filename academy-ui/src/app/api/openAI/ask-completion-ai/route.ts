import { MutationAskCompletionAiArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CompletionCreateParamsNonStreaming } from 'openai/resources';

async function postHandler(req: NextRequest) {
  const args: MutationAskCompletionAiArgs = await req.json();
  const createCompletionRequest: CompletionCreateParamsNonStreaming = {
    model: 'gpt-3.5-turbo-instruct',
    prompt: args.input.prompt,
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

  const completion = await openai.completions.create(createCompletionRequest, { timeout: 5 * 60 * 1000 });
  return NextResponse.json({ completion }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
