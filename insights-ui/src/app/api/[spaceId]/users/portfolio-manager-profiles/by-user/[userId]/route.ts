import { prisma } from '@/prisma';
import { PortfolioManagerProfile } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CreatePortfolioManagerProfileRequest } from '@/types/portfolio';

// GET /api/[spaceId]/users/portfolio-manager-profiles/by-user/[userId] - Get portfolio manager profile by user ID (admin only + to check if user has a profile)
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ userId: string }> }
): Promise<PortfolioManagerProfile | null> {
  const { userId: targetUserId } = await params;

  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirst({
    where: {
      userId: targetUserId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  return portfolioManagerProfile;
}

// POST /api/[spaceId]/users/portfolio-manager-profiles/by-user/[userId] - Create portfolio manager profile for user (admin only)
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ userId: string }> }
): Promise<PortfolioManagerProfile> {
  const { userId: targetUserId } = await params;
  const body: CreatePortfolioManagerProfileRequest = await req.json();

  // Check if profile already exists for this user
  const existingProfile = await prisma.portfolioManagerProfile.findFirst({
    where: {
      userId: targetUserId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingProfile) {
    throw new Error('Portfolio manager profile already exists for this user');
  }

  // Create the profile
  const portfolioManagerProfile = await prisma.portfolioManagerProfile.create({
    data: {
      userId: targetUserId,
      headline: body.headline,
      summary: body.summary,
      detailedDescription: body.detailedDescription,
      country: body.country,
      managerType: body.managerType,
      isPublic: body.isPublic || false,
      profileImageUrl: body.profileImageUrl || null,
      spaceId: KoalaGainsSpaceId,
      createdBy: userContext.userId,
    },
  });

  return portfolioManagerProfile;
}

export const GET = withLoggedInUser<PortfolioManagerProfile | null>(getHandler);
export const POST = withLoggedInUser<PortfolioManagerProfile>(postHandler);
