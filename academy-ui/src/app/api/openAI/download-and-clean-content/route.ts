import downloadFromAllLinks from '@/app/api/helpers/ai/text/downloadFromAllLinks';
import { MutationDownloadAndCleanContentArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationDownloadAndCleanContentArgs = await req.json();
  return NextResponse.json({ downloadAndCleanContent: await downloadFromAllLinks(args.input) }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
