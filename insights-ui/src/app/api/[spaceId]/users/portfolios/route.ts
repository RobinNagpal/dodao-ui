import { prisma } from '@/prisma';
import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/[spaceId]/portfolios - Get all portfolios for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ portfolios: Portfolio[] }> {
  const { userId } = userContext;

  // First get the user's portfolio manager profile
  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirst({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!portfolioManagerProfile) {
    return { portfolios: [] };
  }

  const portfolios = await prisma.portfolio.findMany({
    where: {
      portfolioManagerProfileId: portfolioManagerProfile.id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioTickers: {
        include: {
          ticker: true,
          tags: true,
          lists: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { portfolios };
}

// POST /api/[spaceId]/portfolios - Create a new portfolio
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<Portfolio> {
  const { userId } = userContext;
  const body: CreatePortfolioRequest = await req.json();

  // Get the user's portfolio manager profile
  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirst({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!portfolioManagerProfile) {
    throw new Error('Portfolio manager profile not found. Please create a profile first.');
  }

  // Create the portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      portfolioManagerProfileId: portfolioManagerProfile.id,
      name: body.name,
      summary: body.summary,
      detailedDescription: body.detailedDescription,
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
    },
    include: {
      portfolioTickers: {
        include: {
          ticker: true,
          tags: true,
          lists: true,
        },
      },
    },
  });

  return portfolio;
}

// PUT /api/[spaceId]/portfolios?id={id} - Update a portfolio
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<Portfolio> {
  const { userId } = userContext;
  const body: UpdatePortfolioRequest = await req.json();
  const { searchParams } = new URL(req.url);
  const portfolioId = searchParams.get('id');

  if (!portfolioId) {
    throw new Error('Portfolio ID is required');
  }

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!existingPortfolio || existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  // Update the portfolio
  const updatedPortfolio = await prisma.portfolio.update({
    where: {
      id: portfolioId,
    },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      summary: body.summary !== undefined ? body.summary : undefined,
      detailedDescription: body.detailedDescription !== undefined ? body.detailedDescription : undefined,
      updatedBy: userId,
    },
    include: {
      portfolioTickers: {
        include: {
          ticker: true,
          tags: true,
          lists: true,
        },
      },
    },
  });

  return updatedPortfolio;
}

// DELETE /api/[spaceId]/portfolios?id={id} - Delete a portfolio
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const portfolioId = searchParams.get('id');

  if (!portfolioId) {
    throw new Error('Portfolio ID is required');
  }

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (!existingPortfolio || existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  // Delete the portfolio (cascade will delete portfolio tickers)
  await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<{ portfolios: Portfolio[] }>(getHandler);
export const POST = withLoggedInUser<Portfolio>(postHandler);
export const PUT = withLoggedInUser<Portfolio>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
