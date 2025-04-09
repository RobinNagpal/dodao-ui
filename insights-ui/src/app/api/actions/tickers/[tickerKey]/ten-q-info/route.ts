import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Latest10QInfo } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getLatest10QInfoHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<Latest10QInfo> {
  const { tickerKey } = await params;

  // Query the latest10QInfo record based on the tickerKey
  const latest10QInfo = await prisma.latest10QInfo.findFirst({
    where: { tickerKey },
  });

  if (!latest10QInfo) {
    throw new Error(`No latest10QInfo found for tickerKey: ${tickerKey}`);
  }

  return latest10QInfo;
}

export const GET = withErrorHandlingV2<Latest10QInfo>(getLatest10QInfoHandler);
