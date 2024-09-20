import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { MutationCreateClickableDemoHtmlCaptureArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationCreateClickableDemoHtmlCaptureArgs = await req.json();
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(spaceId!);
  console.log('spaceById', spaceById);
  try {
    if (apiKey) {
      await validateApiKey(apiKey, spaceId!);
    } else if (spaceById.id !== 'tidbitshub') {
      await checkEditSpacePermission(spaceById, req);
    }
    // Create a new ClickableDemoHtmlCapture record in the database
    const capture = await prisma.clickableDemoHtmlCaptures.create({
      data: {
        id: slugify(args.input.fileName) + '-' + uuidv4().toString().substring(0, 4),
        clickableDemoId: args.input.clickableDemoId,
        fileName: args.input.fileName,
        fileUrl: args.input.fileUrl,
        imageUrl: args.input.imageUrl,
        createdAt: new Date(),
      },
    });
    return NextResponse.json({ capture }, { status: 200 });
  } catch (error) {
    await logError((error as any)?.response?.data || 'Error in createHtmlCapture', {}, error as any, null, null);
    throw new Error(`Failed to create ClickableDemoHtmlCapture: ${(error as Error).message}`);
  }
}

export const POST = withErrorHandling(postHandler);
