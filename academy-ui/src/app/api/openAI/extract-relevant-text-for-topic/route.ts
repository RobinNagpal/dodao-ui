import { getTokenCount } from '@/app/api/helpers/ai/getTokenCount';
import { extractInformationForTopic } from '@/app/api/helpers/ai/process/extractInformationForTopic';
import { MutationExtractRelevantTextForTopicArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationExtractRelevantTextForTopicArgs = await req.json();
  const text = await extractInformationForTopic(args.input.content, args.input.topic);
  return NextResponse.json({ body: { text, tokenCount: getTokenCount(text) } }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
