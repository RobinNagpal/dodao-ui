import { getTokenCount } from '@/app/api/helpers/ai/getTokenCount';
import { generateSummaryOfContent } from '@/app/api/helpers/ai/process/createSummary';
import { MutationCreateSummaryOfContentArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationCreateSummaryOfContentArgs = await req.json();
  const text = await generateSummaryOfContent(args.input);
  return NextResponse.json({ body: { text, tokenCount: getTokenCount(text) } }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
