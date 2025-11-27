import { prisma } from '@/prisma';
import { PortfolioTicker, CreatePortfolioTickerRequest, UpdatePortfolioTickerRequest } from '@/types/portfolio';
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
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<PortfolioTicker> {
  const { id: profileId, portfolioId } = await params;
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

// PUT /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId]/tickers?id={tickerId} - Update a portfolio ticker (owner only)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<PortfolioTicker> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;
  const body: UpdatePortfolioTickerRequest = await req.json();
  const tickerId = req.nextUrl.searchParams.get('id');

  if (!tickerId) {
    throw new Error('Ticker ID is required');
  }

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

// DELETE /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId]/tickers?id={tickerId} - Remove a ticker from portfolio (owner only)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<{ success: boolean }> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;
  const tickerId = req.nextUrl.searchParams.get('id');

  if (!tickerId) {
    throw new Error('Ticker ID is required');
  }

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

export const POST = withLoggedInUser<PortfolioTicker>(postHandler);
export const PUT = withLoggedInUser<PortfolioTicker>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
