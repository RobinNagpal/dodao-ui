import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { GuideSettingsDto } from '@/types/space/SpaceDto';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as { spaceId: string; input: GuideSettingsDto };
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
    data: {
      guideSettings: {
        askForLoginToSubmit: input.askForLoginToSubmit,
        captureRating: input.captureRating,
        showIncorrectAfterEachStep: input.showIncorrectAfterEachStep,
        showIncorrectOnCompletion: input.showIncorrectOnCompletion,
      },
    },
    where: {
      id: spaceId,
    },
  });

  return NextResponse.json({ space }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
