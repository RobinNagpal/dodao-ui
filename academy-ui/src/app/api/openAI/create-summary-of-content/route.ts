import { getTokenCount } from '@/app/api/helpers/ai/getTokenCount';
import { generateSummaryOfContent } from '@/app/api/helpers/ai/process/createSummary';
import { MutationCreateSummaryOfContentArgs } from '@/graphql/generated/generated-types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationCreateSummaryOfContentArgs = await req.json();
  const text = await generateSummaryOfContent(args.input);
  return NextResponse.json({ status: 200, body: { text, tokenCount: getTokenCount(text) } });
}
