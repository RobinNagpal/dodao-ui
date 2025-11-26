import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import PortfolioManagersPageComponent from '@/components/portfolios/PortfolioManagersPageComponent';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BriefcaseIcon } from '@heroicons/react/24/outline';

const WEEK = 60 * 60 * 24 * 7;

export default async function ProfessionalManagersPage() {
  const managerType = PortfolioManagerType.ProfessionalManager;

  // Fetch portfolio managers by type
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/type/${managerType}`, {
    next: { revalidate: WEEK },
  });

  const profilesData: { profiles: PortfolioManagerProfileWithUser[] } = await response.json();
  const profiles = profilesData.profiles || [];

  return (
    <PortfolioManagersPageComponent
      profiles={profiles}
      managerType={managerType}
      title="Professional Portfolio Managers"
      icon={BriefcaseIcon}
      emptyStateTitle="No professional portfolio managers found"
      emptyStateDescription="There are no professional portfolio managers yet."
    />
  );
}
