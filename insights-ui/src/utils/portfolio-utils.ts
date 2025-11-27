import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

/**
 * Verifies that a portfolio belongs to the specified user.
 * Throws an error if the portfolio doesn't exist or doesn't belong to the user.
 *
 * @param profileId - The portfolio manager profile ID
 * @param portfolioId - The portfolio ID
 * @param userId - The user ID to verify ownership against
 * @returns The portfolio object with portfolioManagerProfile included
 */
export async function verifyPortfolioOwnership(profileId: string, portfolioId: string, userId: string) {
  const portfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  return portfolio;
}
