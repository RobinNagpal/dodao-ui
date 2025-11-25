import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ProfileHeader from '@/components/portfolios/ProfileHeader';
import PortfolioCards from '@/components/portfolios/PortfolioCards';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { notFound } from 'next/navigation';

interface PortfolioManagerPortfoliosPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioManagerPortfoliosPage({ params: paramsPromise }: PortfolioManagerPortfoliosPageProps) {
  const params = await paramsPromise;
  const portfolioManagerId = params.id;

  // Fetch portfolio manager profile with portfolios and tickers in single API call
  const profileResponse = await fetch(`${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerId}`, {
    cache: 'no-store',
  });

  if (!profileResponse.ok) {
    notFound();
  }

  const profileData: { portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser } = await profileResponse.json();
  const profile = profileData.portfolioManagerProfile;

  if (!profile) {
    notFound();
  }

  // Extract portfolios from the profile data (already includes tickers)
  const portfolios = profile.portfolios || [];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} showEditButton={false} />

          {/* Portfolios Section */}
          <PortfolioCards portfolios={portfolios} portfolioManagerId={portfolioManagerId} isOwner={false} />
        </div>
      </div>
    </PageWrapper>
  );
}
