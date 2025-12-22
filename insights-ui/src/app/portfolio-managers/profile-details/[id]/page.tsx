import ProfileHeader from '@/components/portfolios/ProfileHeader';
import PortfolioCards from '@/components/portfolios/PortfolioCards';
import IndustryAnalysisSection from '@/components/portfolios/IndustryAnalysisSection';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getPortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getListingPageByManagerType } from '@/utils/portfolio-manager-utils';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updatedAt?: string }>;
}

const WEEK = 60 * 60 * 24 * 7;

export default async function PortfolioManagerProfilePage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const portfolioManagerId = params.id;

  // Fetch portfolio manager profile on server
  const res = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerId}`, {
    next: { revalidate: WEEK, tags: [getPortfolioProfileTag(portfolioManagerId)] },
  });

  const data = await res.json();
  const profile = data.portfolioManagerProfile as PortfolioManagerProfilewithPortfoliosAndUser | null;

  if (!profile) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
            <p className="text-gray-400">The portfolio manager profile you’re looking for doesn’t exist.</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const portfolios = profile.portfolios || [];
  const limitedPortfolios = portfolios.slice(0, 3); // Only show latest 3 portfolios
  const hasMorePortfolios = portfolios.length > 3;
  const industriesByCountry = profile.industriesByCountry || [];

  const listingPage = getListingPageByManagerType(profile.managerType);
  const breadcrumbs = [
    listingPage,
    { name: profile.user.name || 'Portfolio Manager', href: `/portfolio-managers/profile-details/${portfolioManagerId}`, current: true },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="pb-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} portfolioManagerId={portfolioManagerId} />

          {/* Industry Analysis Section */}
          <IndustryAnalysisSection industriesByCountry={industriesByCountry} portfolioManagerId={portfolioManagerId} />

          {/* Portfolios Section */}
          <PortfolioCards portfolios={limitedPortfolios} portfolioManagerId={portfolioManagerId} />

          {/* View All Portfolios Button */}
          {hasMorePortfolios && (
            <div className="mt-8 text-center">
              <a
                href={`/portfolio-managers/profile-details/${portfolioManagerId}/portfolios`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 inline-block"
              >
                View All Portfolios ({portfolios.length})
              </a>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
