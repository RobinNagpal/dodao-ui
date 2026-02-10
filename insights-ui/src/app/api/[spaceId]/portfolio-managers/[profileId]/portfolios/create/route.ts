import { prisma } from '@/prisma';
import { Portfolio, CreatePortfolioRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { revalidatePortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';
import { verifyProfileOwnership } from '@/utils/portfolio-utils';

// POST /api/[spaceId]/portfolio-managers/[id]/portfolios/create - Create a new portfolio for a profile (owner only)
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ profileId: string }> }): Promise<Portfolio> {
  const { profileId } = await params;
  const { userId } = userContext;
  const body: CreatePortfolioRequest = await req.json();

  // Verify the profile belongs to the user (or user is admin)
  await verifyProfileOwnership(profileId, userId);

  // Create the portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      portfolioManagerProfileId: profileId,
      name: body.name,
      summary: body.summary,
      detailedDescription: body.detailedDescription,
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
    },
    include: {
      portfolioTickers: {
        include: {
          ticker: {
            include: {
              cachedScoreEntry: true,
            },
          },
          tags: true,
          lists: true,
        },
      },
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(profileId);

  return portfolio;
}

export const POST = withLoggedInUser<Portfolio>(postHandler);
