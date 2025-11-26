import { PortfolioManagerType } from '@/types/portfolio-manager';
import { TrophyIcon } from '@heroicons/react/24/outline';
import PortfolioManagersPageComponent from '@/components/portfolios/PortfolioManagersPageComponent';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import { getPortfolioManagersByTypeTag } from '@/utils/ticker-v1-cache-utils';

const WEEK = 60 * 60 * 24 * 7;

export default async function TopRankedPortfolioManagersPage() {
  const managerType = PortfolioManagerType.TopRanked;

  let profiles: PortfolioManagerProfileWithUser[] = [];
  // Fetch portfolio managers by type

  try {
    const response = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/portfolio-managers/type/${managerType}`, {
      next: { revalidate: WEEK, tags: [getPortfolioManagersByTypeTag(managerType)] },
    });

    const profilesData: { profiles: PortfolioManagerProfileWithUser[] } = await response.json();
    profiles = profilesData.profiles || [];
  } catch (e: any | undefined | null) {
    console.error(`Error fetching college ambassadors: ${e?.message} \n ${e?.stack}`);
  }

  return (
    <PortfolioManagersPageComponent
      profiles={profiles}
      managerType={managerType}
      title="Top Ranked Portfolio Managers"
      icon={TrophyIcon}
      emptyStateTitle="No top ranked portfolio managers found"
      emptyStateDescription="There are no top ranked portfolio managers yet."
    />
  );
}
