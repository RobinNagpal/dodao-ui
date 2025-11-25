import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import { UserIcon } from '@heroicons/react/24/outline';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/country/[country]/route';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import ProfileGrid from '@/components/portfolios/ProfileGrid';

interface CountryPortfolioManagersPageProps {
  params: {
    country: string;
  };
}

export default async function CountryPortfolioManagersPage({ params }: CountryPortfolioManagersPageProps) {
  const country = params.country;

  // Fetch portfolio managers with MostFamous type
  const response = await fetch(
    `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/portfolio-managers/country/${country}?managerType=${PortfolioManagerType.MostFamous}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio managers');
  }

  const profilesData: { profiles: PortfolioManagerProfileWithUser[] } = await response.json();
  const profiles = profilesData.profiles || [];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Most Famous Portfolio Managers in {country}</h1>
            <p className="text-gray-400">
              {profiles.length} portfolio manager{profiles.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Portfolio Managers Grid */}
          <ProfileGrid
            profiles={profiles}
            emptyStateConfig={{
              icon: UserIcon,
              title: 'No portfolio managers found',
              description: `There are no famous portfolio managers from ${country} yet.`,
            }}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
