import { prisma } from '@/prisma';
import { PortfolioTicker, CreatePortfolioTickerRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { revalidatePortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';
import { verifyPortfolioOwnership } from '@/utils/portfolio-utils';

// POST /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId]/tickers - Add a ticker to a portfolio (owner only)
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ profileId: string; portfolioId: string }> }
): Promise<PortfolioTicker> {
  const { profileId, portfolioId } = await params;
  const { userId } = userContext;
  const body: CreatePortfolioTickerRequest = await req.json();

  // Verify the portfolio belongs to the user
  await verifyPortfolioOwnership(profileId, portfolioId, userId);

  // Check if ticker already exists in portfolio
  const existingTicker = await prisma.portfolioTicker.findFirst({
    where: {
      portfolioId: portfolioId,
      tickerId: body.tickerId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingTicker) {
    throw new Error('Ticker already exists in this portfolio');
  }

  // Create the portfolio ticker
  const portfolioTicker = await prisma.portfolioTicker.create({
    data: {
      portfolioId: portfolioId,
      tickerId: body.tickerId,
      allocation: body.allocation,
      detailedDescription: body.detailedDescription || undefined,
      competitors: body.competitors || [],
      alternatives: body.alternatives || [],
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
      ...(body.tagIds &&
        body.tagIds.length > 0 && {
          tags: {
            connect: body.tagIds.map((id) => ({ id })),
          },
        }),
      ...(body.listIds &&
        body.listIds.length > 0 && {
          lists: {
            connect: body.listIds.map((id) => ({ id })),
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

  return portfolioTicker;
}

export const POST = withLoggedInUser<PortfolioTicker>(postHandler);
