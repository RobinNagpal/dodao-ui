import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import PortfolioManagersPageComponent from '@/components/portfolios/PortfolioManagersPageComponent';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const WEEK = 60 * 60 * 24 * 7;

export default async function CollegeAmbassadorsPage() {
  const managerType = PortfolioManagerType.CollegeAmbassador;

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
      title="College Ambassadors"
      icon={AcademicCapIcon}
      emptyStateTitle="No college ambassadors found"
      emptyStateDescription="There are no college ambassadors yet."
      showCollegeAmbassadorBadge={true}
    />
  );
}
