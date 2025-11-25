import { prisma } from '@/prisma';
import { PortfolioManagerProfile, Portfolio, PortfolioTicker, User } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withLoggedInUser, withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { UpdatePortfolioManagerProfileRequest, PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';

// GET /api/[spaceId]/users/portfolio-manager-profiles/[id] - Get a portfolio manager profile by ID (for public viewing)
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser | null }> {
  const { id } = await params;

  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      user: true,
      portfolios: {
        include: {
          portfolioTickers: {
            include: {
              ticker: {
                include: {
                  cachedScoreEntry: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return { portfolioManagerProfile };
}

// PUT /api/[spaceId]/users/portfolio-manager-profiles/[id] - Update a portfolio manager profile by ID (both admin and user can update)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<PortfolioManagerProfile> {
  const { id } = await params;
  const body: UpdatePortfolioManagerProfileRequest = await req.json();

  // Find the profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
  });

  // Update the profile
  const updatedProfile = await prisma.portfolioManagerProfile.update({
    where: {
      id: id,
    },
    data: {
      ...(body.headline !== undefined && { headline: body.headline }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.managerType !== undefined && { managerType: body.managerType }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.profileImageUrl !== undefined && { profileImageUrl: body.profileImageUrl }),
      updatedBy: userContext.userId,
    },
  });

  return updatedProfile;
}

// DELETE /api/[spaceId]/users/portfolio-manager-profiles/[id] - Delete a portfolio manager profile by ID (only admin can delete)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  // Find the profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
  });

  await prisma.portfolioManagerProfile.delete({
    where: {
      id: id,
    },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<{ portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser | null }>(getHandler);
export const PUT = withLoggedInUser<PortfolioManagerProfile>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
