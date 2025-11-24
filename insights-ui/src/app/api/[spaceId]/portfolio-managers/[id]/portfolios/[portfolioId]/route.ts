import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Portfolio } from '@/types/portfolio';
import { UpdatePortfolioRequest } from '@/types/portfolio';

// GET /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Get a specific portfolio (public)
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<{ portfolio: Portfolio }> {
  const { id: profileId, portfolioId } = await params;

  const portfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: {
        include: {
          user: true,
        },
      },
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
        orderBy: {
          allocation: 'desc',
        },
      },
    },
  });

  // Populate competitors and alternatives as full ticker objects
  const portfolioWithCompetitors = {
    ...portfolio,
    portfolioTickers: await Promise.all(
      portfolio.portfolioTickers.map(async (pt) => {
        const ptWithFields = pt as typeof pt & { competitors: string[]; alternatives: string[] };

        const competitors =
          ptWithFields.competitors && ptWithFields.competitors.length > 0
            ? await prisma.tickerV1.findMany({
                where: {
                  id: { in: ptWithFields.competitors },
                  spaceId: KoalaGainsSpaceId,
                },
                include: {
                  cachedScoreEntry: true,
                },
              })
            : [];

        const alternatives =
          ptWithFields.alternatives && ptWithFields.alternatives.length > 0
            ? await prisma.tickerV1.findMany({
                where: {
                  id: { in: ptWithFields.alternatives },
                  spaceId: KoalaGainsSpaceId,
                },
                include: {
                  cachedScoreEntry: true,
                },
              })
            : [];

        return {
          ...pt,
          competitorsConsidered: competitors,
          betterAlternatives: alternatives,
        };
      })
    ),
  };

  return { portfolio: portfolioWithCompetitors };
}

// PUT /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Update a portfolio (owner only)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<Portfolio> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;
  const body: UpdatePortfolioRequest = await req.json();

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  // Update the portfolio
  const updatedPortfolio = await prisma.portfolio.update({
    where: {
      id: portfolioId,
    },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
      updatedBy: userId,
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

  return updatedPortfolio;
}

// DELETE /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Delete a portfolio (owner only)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<{ success: boolean }> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  // Delete the portfolio (cascade will delete portfolio tickers)
  await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<{ portfolio: Portfolio }>(getHandler);
export const PUT = withLoggedInUser<Portfolio>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);

