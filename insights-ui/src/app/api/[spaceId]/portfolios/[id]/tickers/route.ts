import { prisma } from '@/prisma';
import { PortfolioTicker, CreatePortfolioTickerRequest, UpdatePortfolioTickerRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/[spaceId]/portfolios/[id]/tickers - Get all tickers in a portfolio
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<{ portfolioTickers: PortfolioTicker[] }> {
  const { userId } = userContext;
  const { id } = params;

  // Verify the portfolio belongs to the user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!portfolio || portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  const portfolioTickers = await prisma.portfolioTicker.findMany({
    where: {
      portfolioId: id,
      spaceId: KoalaGainsSpaceId,
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
    orderBy: {
      allocation: 'desc',
    },
  });

    // Populate competitors and alternatives as full ticker objects
  const populatedPortfolioTickers = await Promise.all(
    portfolioTickers.map(async (pt) => {
      const ptWithFields = pt as typeof pt & { competitors: string[]; alternatives: string[] };

      const competitors = ptWithFields.competitors && ptWithFields.competitors.length > 0
        ? await prisma.tickerV1.findMany({
            where: {
              id: { in: ptWithFields.competitors },
              spaceId: KoalaGainsSpaceId,
            },
          })
        : [];

      const alternatives = ptWithFields.alternatives && ptWithFields.alternatives.length > 0
        ? await prisma.tickerV1.findMany({
            where: {
              id: { in: ptWithFields.alternatives },
              spaceId: KoalaGainsSpaceId,
            },
          })
        : [];

      return {
        ...pt,
        competitorsConsidered: competitors,
        betterAlternatives: alternatives,
      };
    })
  );

  return { portfolioTickers: populatedPortfolioTickers };
}

// POST /api/[spaceId]/portfolios/[id]/tickers - Add a ticker to a portfolio
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<PortfolioTicker> {
  const { userId } = userContext;
  const { id } = params;
  const body: CreatePortfolioTickerRequest = await req.json();

  // Verify the portfolio belongs to the user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!portfolio || portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  // Check if ticker already exists in portfolio
  const existingTicker = await prisma.portfolioTicker.findFirst({
    where: {
      portfolioId: id,
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
      portfolioId: id,
      tickerId: body.tickerId,
      allocation: body.allocation,
      detailedDescription: body.detailedDescription || undefined,
      competitors: body.competitors || [],
      alternatives: body.alternatives || [],
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
      // Handle tags and lists if provided
      ...(body.tagIds && body.tagIds.length > 0 && {
        tags: {
          connect: body.tagIds.map(id => ({ id })),
        },
      }),
      ...(body.listIds && body.listIds.length > 0 && {
        lists: {
          connect: body.listIds.map(id => ({ id })),
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

  return portfolioTicker;
}

// PUT /api/[spaceId]/portfolios/[id]/tickers?id={tickerId} - Update a portfolio ticker
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<PortfolioTicker> {
  const { userId } = userContext;
  const { id } = params;
  const body: UpdatePortfolioTickerRequest = await req.json();
  const { searchParams } = new URL(req.url);
  const tickerId = searchParams.get('id');

  if (!tickerId) {
    throw new Error('Ticker ID is required');
  }

  // Verify the portfolio belongs to the user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!portfolio || portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

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
      // Handle tags and lists updates
      ...(body.tagIds !== undefined && {
        tags: {
          set: body.tagIds.map(id => ({ id })),
        },
      }),
      ...(body.listIds !== undefined && {
        lists: {
          set: body.listIds.map(id => ({ id })),
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

  return updatedPortfolioTicker;
}

// DELETE /api/[spaceId]/portfolios/[id]/tickers?id={tickerId} - Remove a ticker from portfolio
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const tickerId = searchParams.get('id');

  if (!tickerId) {
    throw new Error('Ticker ID is required');
  }

  // Verify the portfolio belongs to the user
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!portfolio || portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  // Delete the portfolio ticker
  await prisma.portfolioTicker.delete({
    where: {
      id: tickerId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<{ portfolioTickers: PortfolioTicker[] }>(getHandler);
export const POST = withLoggedInUser<PortfolioTicker>(postHandler);
export const PUT = withLoggedInUser<PortfolioTicker>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
