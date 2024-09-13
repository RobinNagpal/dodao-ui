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
  const headers = req.headers;
  const apiKey = headers.get('X-API-KEY');
  const spaceById = await getSpaceById(args.spaceId);
  if (apiKey) {
    // Fetch all space integrations that might contain any API keys
    try {
      const spaceIntegration = await prisma.spaceIntegration.findUnique({
        where: {
          spaceId: args.spaceId,
        },
      });

      let apiKeyFound = false;

      if (spaceIntegration && spaceIntegration.spaceApiKeys) {
        spaceIntegration.spaceApiKeys.forEach((Key, index) => {
          if (Key.apiKey === apiKey) {
            // Update apiKey properties here
            spaceIntegration.spaceApiKeys[index].lastUsed = new Date();

            apiKeyFound = true;
          }
        });
      }

      if (!apiKeyFound) {
        throw new Error('API Key is not valid');
      }
      if (apiKeyFound) {
        await prisma.spaceIntegration.update({
          where: {
            spaceId: args.spaceId,
          },
          data: {
            spaceApiKeys: spaceIntegration?.spaceApiKeys,
          },
        });
      }
      return NextResponse.json({ url: await presignedUrlCreator.createSignedUrl(spaceById.id, args.input) }, { status: 200 });
    } catch (e) {
      await logError((e as any)?.response?.data || 'Error in createSignedUrls', {}, e as any, null, null);
      throw e;
    }
  }
  try {
    // Check if the space is not TIDBITS_HUB as it is used to add logos for new tidbit sites
    if (spaceById.id !== 'tidbitshub') {
      await checkEditSpacePermission(spaceById, req);
    }

    return NextResponse.json({ url: await presignedUrlCreator.createSignedUrl(spaceById.id, args.input) }, { status: 200 });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in createSignedUrls', {}, e as any, null, null);
    throw e;
  }
}

export const POST = withErrorHandling(postHandler);
