import { MutationCreateSignedUrlArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

async function postHandler(req: NextRequest) {
  const args: MutationCreateSignedUrlArgs = await req.json();
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(args.spaceId);

  try {
    if (apiKey) {
      await validateApiKey(apiKey, args.spaceId);
    } else if (spaceById.id !== 'tidbitshub') {
      await checkEditSpacePermission(spaceById, req);
    }

    const url = await presignedUrlCreator.createSignedUrl(spaceById.id, args.input);
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    await logError((error as any)?.response?.data || 'Error in createSignedUrls', {}, error, null, null);
    throw error;
  }
}

async function validateApiKey(apiKey: string, spaceId: string) {
  const spaceIntegration = await prisma.spaceIntegration.findUnique({
    where: { spaceId },
  });

  if (!spaceIntegration?.spaceApiKeys) {
    throw new Error('API Key is not valid');
  }

  const apiKeyEntry = spaceIntegration.spaceApiKeys.find((key) => key.apiKey === apiKey);

  if (!apiKeyEntry) {
    throw new Error('API Key is not valid');
  }

  apiKeyEntry.lastUsed = new Date();

  await prisma.spaceIntegration.update({
    where: { spaceId },
    data: { spaceApiKeys: spaceIntegration.spaceApiKeys },
  });
}

export const POST = withErrorHandling(postHandler);
