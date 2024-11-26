import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { SpaceWithIntegrationsDto, ThemeColorsDto } from '@/types/space/SpaceDto';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<{ space: SpaceWithIntegrationsDto }>> {
  const { spaceId } = await params;
  const themeColors = (await req.json()) as ThemeColorsDto;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  await prisma.space.update({
    data: {
      themeColors: {
        primaryColor: themeColors.primaryColor,
        primaryTextColor: themeColors.primaryTextColor,
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

export const PUT = withErrorHandlingV1<{ space: SpaceWithIntegrationsDto }>(putHandler);
