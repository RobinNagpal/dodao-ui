import { prisma } from '@/prisma';
import { PortfolioTicker, UpdatePortfolioTickerRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { revalidatePortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';
import { verifyPortfolioOwnership } from '@/utils/portfolio-utils';

// PUT /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId]/tickers/[tickerId] - Update a portfolio ticker (owner only)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ profileId: string; portfolioId: string; tickerId: string }> }
): Promise<PortfolioTicker> {
  const { profileId, portfolioId, tickerId } = await params;
  const { userId } = userContext;
  const body: UpdatePortfolioTickerRequest = await req.json();

  // Verify the portfolio belongs to the user
  await verifyPortfolioOwnership(profileId, portfolioId, userId);

  // Update the portfolio ticker
  const updatedPortfolioTicker = await prisma.portfolioTicker.update({
    where: {
      id: tickerId,
    },
    data: {
      allocation: body.allocation !== undefined ? body.allocation : undefined,
      detailedDescription: body.detailedDescription !== undefined ? body.detailedDescription : undefined,
      competitors: body.competitors !== undefined ? body.competitors : undefined,
      alternatives: body.alternatives !== undefined ? body.alternatives : undefined,
      updatedBy: userId,
      ...(body.tagIds !== undefined && {
        tags: {
          set: body.tagIds.map((id) => ({ id })),
        },
      }),
      ...(body.listIds !== undefined && {
        lists: {
          set: body.listIds.map((id) => ({ id })),
        },
      }),
    },
    include: {
      ticker: {
        include: {
          cachedScoreEntry: true,
        },
      },
      tags: true,
      lists: true,
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(profileId);

  return updatedPortfolioTicker;
}

// DELETE /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId]/tickers/[tickerId] - Remove a ticker from portfolio (owner only)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ profileId: string; portfolioId: string; tickerId: string }> }
): Promise<{ success: boolean }> {
  const { profileId, portfolioId, tickerId } = await params;
  const { userId } = userContext;

  // Verify the portfolio belongs to the user
  await verifyPortfolioOwnership(profileId, portfolioId, userId);

  // Delete the portfolio ticker
  await prisma.portfolioTicker.delete({
    where: {
      id: tickerId,
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(profileId);

  return { success: true };
}

export const PUT = withLoggedInUser<PortfolioTicker>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
