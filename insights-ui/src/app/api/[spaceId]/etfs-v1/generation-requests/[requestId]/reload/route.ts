import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { EtfGenerationRequestStatus } from '@/types/etf/etf-analysis-types';
import { EtfGenerationRequest } from '@prisma/client';
import { NextRequest } from 'next/server';

async function postHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; requestId: string }> }
): Promise<EtfGenerationRequest> {
  const { requestId } = await params;

  const existingRequest = await prisma.etfGenerationRequest.findUniqueOrThrow({
    where: { id: requestId },
  });

  if (existingRequest.status !== EtfGenerationRequestStatus.Failed) {
    throw new Error(`Cannot reload request with status: ${existingRequest.status}. Only failed requests can be reloaded.`);
  }

  return await prisma.etfGenerationRequest.update({
    where: { id: requestId },
    data: {
      status: EtfGenerationRequestStatus.NotStarted,
      failedSteps: [],
      inProgressStep: null,
      startedAt: null,
      completedAt: null,
      lastInvocationTime: null,
      updatedAt: new Date(),
    },
  });
}

export const POST = withAdminOrToken<EtfGenerationRequest>(postHandler);
