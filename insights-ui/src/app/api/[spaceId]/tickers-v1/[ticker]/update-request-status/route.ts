import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';

interface UpdateRequestStatusPayload {
  id: string;
  status: GenerationRequestStatus;
}

interface UpdateRequestStatusResponse {
  success: boolean;
  generationRequestId: string;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<UpdateRequestStatusResponse> {
  const { spaceId } = await params;
  const payload = (await req.json()) as UpdateRequestStatusPayload;

  const { id, status } = payload;

  // Validate status is a valid enum value
  if (!Object.values(GenerationRequestStatus).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Update the generation request
  const updatedRequest = await prisma.tickerV1GenerationRequest.update({
    where: {
      id,
    },
    data: {
      status,
      updatedAt: new Date(),
      ...(status === GenerationRequestStatus.InProgress && {
        startedAt: new Date(),
      }),
      ...(status === GenerationRequestStatus.Completed && {
        completedAt: new Date(),
      }),
    },
  });

  return {
    success: true,
    generationRequestId: updatedRequest.id,
  };
}

export const POST = withErrorHandlingV2<UpdateRequestStatusResponse>(postHandler);
