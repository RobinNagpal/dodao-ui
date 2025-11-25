import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getPortfolioManagersByCountryTag } from '@/utils/ticker-v1-cache-utils';
import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/country/[country]/route';
import ProfileGrid from '@/components/portfolios/ProfileGrid';

const WEEK = 60 * 60 * 24 * 7;

interface CollegeAmbassadorsPageProps {
  params: Promise<{ country: string }>;
}

export default async function CollegeAmbassadorsPage({ params: paramsPromise }: CollegeAmbassadorsPageProps) {
  const params = await paramsPromise;
  const country = params.country;

  // Fetch portfolio managers with CollegeAmbassador type
  const response = await fetch(
    `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/portfolio-managers/country/${country}?managerType=${PortfolioManagerType.CollegeAmbassador}`,
    { next: { revalidate: WEEK, tags: [getPortfolioManagersByCountryTag(country)] } }
  );

  const profilesData: { profiles: PortfolioManagerProfileWithUser[] } = await response.json();
  const profiles = profilesData.profiles || [];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <AcademicCapIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">College Ambassadors in {country}</h1>
            </div>
            <p className="text-gray-400">
              {profiles.length} college ambassador{profiles.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* College Ambassadors Grid */}
          <ProfileGrid
            profiles={profiles}
            emptyStateConfig={{
              icon: AcademicCapIcon,
              title: 'No college ambassadors found',
              description: `There are no college ambassadors from ${country} yet.`,
            }}
            showCollegeAmbassadorBadge={true}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
