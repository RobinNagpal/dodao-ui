import { MutationUpdateThemeColorsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(req: NextRequest) {
  const { spaceId, themeColors } = (await req.json()) as MutationUpdateThemeColorsArgs;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
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

  return NextResponse.json({ space }, { status: 200 });
}

export const PUT = withErrorHandling(putHandler);
