import downloadFromAllLinks from '@/app/api/helpers/ai/text/downloadFromAllLinks';
import { MutationDownloadAndCleanContentArgs } from '@/graphql/generated/generated-types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDownloadAndCleanContentArgs = await req.json();
  return NextResponse.json({ status: 200, downloadAndCleanContent: await downloadFromAllLinks(args.input) });
}