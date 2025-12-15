import { PortfolioManagerType } from '@/types/portfolio-manager';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import PortfolioManagersPageComponent from '@/components/portfolios/PortfolioManagersPageComponent';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import { getPortfolioManagersByTypeTag } from '@/utils/ticker-v1-cache-utils';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

const WEEK = 60 * 60 * 24 * 7;

export default async function ProfessionalManagersPage() {
  const managerType = PortfolioManagerType.ProfessionalManager;

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

  const breadcrumbs = [{ name: 'Professional Portfolio Managers', href: '/portfolio-managers/professional-managers', current: true }];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PortfolioManagersPageComponent
        profiles={profiles}
        managerType={managerType}
        title="Professional Portfolio Managers"
        icon={BriefcaseIcon}
        emptyStateTitle="No professional portfolio managers found"
        emptyStateDescription="There are no professional portfolio managers yet."
      />
    </PageWrapper>
  );
}
