import { PortfolioManagerType } from '@/types/portfolio-manager';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import PortfolioManagersPageComponent from '@/components/portfolios/PortfolioManagersPageComponent';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';

const WEEK = 60 * 60 * 24 * 7;

export default async function ProfessionalManagersPage() {
  const managerType = PortfolioManagerType.ProfessionalManager;

  // Fetch portfolio managers by type
  const response = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/portfolio-managers/type/${managerType}`, {
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
