import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecFiling, SecFilingAttachment, Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ secFilingId: string }> }): Promise<SecFilingAttachment[]> {
  const { secFilingId } = await params;

  const attachments = await prisma.secFilingAttachment.findMany({
    where: {
      secFilingId: secFilingId,
      spaceId: KoalaGainsSpaceId,
    },
  });
  // Sort attachments outside the query as 'sequenceNumber' is a string
  attachments.sort((a, b) => Number(a.sequenceNumber) - Number(b.sequenceNumber));

  return attachments;
}
export const GET = withErrorHandlingV2<SecFilingAttachment[]>(getHandler);
