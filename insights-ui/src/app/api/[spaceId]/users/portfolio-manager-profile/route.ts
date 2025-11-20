import { prisma } from '@/prisma';
import { PortfolioManagerProfile } from '@prisma/client';
import { CreatePortfolioManagerProfileRequest, UpdatePortfolioManagerProfileRequest } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/[spaceId]/users/portfolio-manager-profile - Get portfolio manager profile for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ portfolioManagerProfile: PortfolioManagerProfile | null }> {
  const { userId } = userContext;

  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  return { portfolioManagerProfile };
}

// POST /api/[spaceId]/users/portfolio-manager-profile - Create a new portfolio manager profile
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<PortfolioManagerProfile> {
  const { userId } = userContext;
  const body: CreatePortfolioManagerProfileRequest = await req.json();

  // Check if the user already has a portfolio manager profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirst({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingProfile) {
    return existingProfile;
  }

  // Create the portfolio manager profile
  const portfolioManagerProfile = await prisma.portfolioManagerProfile.create({
    data: {
      userId: userId,
      headline: body.headline,
      summary: body.summary,
      detailedDescription: body.detailedDescription,
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
    },
  });

  return portfolioManagerProfile;
}

// PUT /api/[spaceId]/users/portfolio-manager-profile - Update the portfolio manager profile
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<PortfolioManagerProfile> {
  const { userId } = userContext;
  const body: UpdatePortfolioManagerProfileRequest = await req.json();

  // Find the existing profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  // Update the portfolio manager profile
  const updatedProfile = await prisma.portfolioManagerProfile.update({
    where: {
      id: existingProfile.id,
    },
    data: {
      headline: body.headline !== undefined ? body.headline : undefined,
      summary: body.summary !== undefined ? body.summary : undefined,
      detailedDescription: body.detailedDescription !== undefined ? body.detailedDescription : undefined,
      updatedBy: userId,
    },
  });

  return updatedProfile;
}

export const GET = withLoggedInUser<{ portfolioManagerProfile: PortfolioManagerProfile | null }>(getHandler);
export const POST = withLoggedInUser<PortfolioManagerProfile>(postHandler);
export const PUT = withLoggedInUser<PortfolioManagerProfile>(putHandler);
