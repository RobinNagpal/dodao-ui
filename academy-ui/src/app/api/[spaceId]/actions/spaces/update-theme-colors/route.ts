import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { MutationUpdateThemeColorsArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { Space, SpaceIntegration } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(req: NextRequest): Promise<NextResponse<{ space: Space & { spaceIntegrations: SpaceIntegration | null } }>> {
  const { spaceId, themeColors } = (await req.json()) as MutationUpdateThemeColorsArgs;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  await prisma.space.update({
    data: {
      themeColors: {
        primaryColor: themeColors.primaryColor,
        bgColor: themeColors.bgColor,
        textColor: themeColors.textColor,
        linkColor: themeColors.linkColor,
        headingColor: themeColors.headingColor,
        borderColor: themeColors.borderColor,
        blockBg: themeColors.blockBg,
      },
    },
    where: {
      id: spaceId,
    },
  });

  const space = await getSpaceWithIntegrations(spaceId);

  return NextResponse.json({ space }, { status: 200 });
}

export const PUT = withErrorHandlingV1<{ space: Space & { spaceIntegrations: SpaceIntegration | null } }>(putHandler);
