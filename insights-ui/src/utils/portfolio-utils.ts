import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user?.role === 'Admin';
}

async function getPortfolioWithProfile(portfolioId: string, profileId: string) {
  return await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });
}

async function getPortfolioManagerProfile(profileId: string) {
  return await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: profileId,
      spaceId: KoalaGainsSpaceId,
    },
  });
}

/**
 * Verifies that a portfolio belongs to the specified user.
 * Throws an error if the portfolio doesn't exist or doesn't belong to the user.
 * Admin users can access any portfolio.
 *
 * @param profileId - The portfolio manager profile ID
 * @param portfolioId - The portfolio ID
 * @param userId - The user ID to verify ownership against
 * @returns The portfolio object with portfolioManagerProfile included
 */
export async function verifyPortfolioOwnership(profileId: string, portfolioId: string, userId: string) {
  // Check if user is admin - if so, they can access any portfolio
  if (await isUserAdmin(userId)) {
    return await getPortfolioWithProfile(portfolioId, profileId);
  }

  // Non-admin users: verify ownership as before
  const portfolio = await getPortfolioWithProfile(portfolioId, profileId);

  if (portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  return portfolio;
}

/**
 * Verifies that a portfolio manager profile belongs to the specified user.
 * Throws an error if the profile doesn't exist or doesn't belong to the user.
 * Admin users can access any profile.
 *
 * @param profileId - The portfolio manager profile ID
 * @param userId - The user ID to verify ownership against
 * @returns The portfolio manager profile object
 */
export async function verifyProfileOwnership(profileId: string, userId: string) {
  // Check if user is admin - if so, they can access any profile
  if (await isUserAdmin(userId)) {
    return await getPortfolioManagerProfile(profileId);
  }

  // Non-admin users: verify ownership as before
  const profile = await getPortfolioManagerProfile(profileId);

  if (profile.userId !== userId) {
    throw new Error('Access denied: You do not own this profile');
  }

  return profile;
}
