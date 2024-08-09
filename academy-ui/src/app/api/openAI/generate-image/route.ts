import { MutationGenerateImageArgs, ImagesResponse } from '@/graphql/generated/generated-types';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ImageGenerateParams } from 'openai/resources';

export async function POST(req: NextRequest) {
  const args: MutationGenerateImageArgs = await req.json();
  const createCompletionRequest: ImageGenerateParams = {
    model: 'dall-e-3',
    prompt: args.input.prompt,
    size: '1024x1024',
    n: 1,
  };

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.images.generate(createCompletionRequest, { timeout: 5 * 60 * 1000 });

  return NextResponse.json({ response }, { status: 200 });
}
