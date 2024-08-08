import downloadFromAllLinks from '@/app/api/helpers/ai/text/downloadFromAllLinks';
import { MutationDownloadAndCleanContentArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationDownloadAndCleanContentArgs = await req.json();
  return NextResponse.json({ status: 200, downloadAndCleanContent: await downloadFromAllLinks(args.input) });
}

export const POST = withErrorHandling(postHandler);
