import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProfileHeader from '@/components/portfolios/ProfileHeader';
import PortfolioCards from '@/components/portfolios/PortfolioCards';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getPortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getListingPageByManagerType } from '@/utils/portfolio-manager-utils';

const WEEK = 60 * 60 * 24 * 7;

interface PortfolioManagerPortfoliosPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioManagerPortfoliosPage({ params: paramsPromise }: PortfolioManagerPortfoliosPageProps) {
  const params = await paramsPromise;
  const portfolioManagerId = params.id;

  // Fetch portfolio manager profile with portfolios and tickers in single API call
  const profileResponse = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerId}`, {
    next: { revalidate: WEEK, tags: [getPortfolioProfileTag(portfolioManagerId)] },
  });

  const profileData: { portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser } = await profileResponse.json();
  const profile = profileData.portfolioManagerProfile;

  // Extract portfolios from the profile data (already includes tickers)
  const portfolios = profile.portfolios || [];

  const listingPage = getListingPageByManagerType(profile.managerType);
  const breadcrumbs = [
    listingPage,
    { name: profile.user.name || 'Portfolio Manager', href: `/portfolio-managers/profile-details/${portfolioManagerId}`, current: false },
    { name: 'All Portfolios', href: `/portfolio-managers/profile-details/${portfolioManagerId}/portfolios`, current: true },
  ];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="pb-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} />

          {/* Portfolios Section */}
          <PortfolioCards portfolios={portfolios} portfolioManagerId={portfolioManagerId} />
        </div>
      </div>
    </PageWrapper>
  );
}
