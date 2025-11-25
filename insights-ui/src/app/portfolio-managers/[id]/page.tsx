'use client';

import AddEditPortfolioProfileModal from '@/components/portfolios/AddEditPortfolioProfileModal';
import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import ProfileHeader from '@/components/portfolios/ProfileHeader';
import PortfolioCards from '@/components/portfolios/PortfolioCards';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useState } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { PortfolioManagerProfile } from '@prisma/client';
import { KoalaGainsSession } from '@/types/auth';

export default function PortfolioManagerProfilePage() {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();
  const params = useParams();
  const portfolioManagerId = params.id as string;

  const [editingProfile, setEditingProfile] = useState<PortfolioManagerProfilewithPortfoliosAndUser | null>(null);
  const [showCreatePortfolioModal, setShowCreatePortfolioModal] = useState(false);

  // Fetch portfolio manager profile
  const {
    data: profileData,
    loading: profileLoading,
    reFetchData: refetchProfile,
  } = useFetchData<{ portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerId}`,
    { skipInitialFetch: !portfolioManagerId },
    'Failed to fetch portfolio manager profile'
  );

  const profile = profileData?.portfolioManagerProfile;
  const portfolios = profile?.portfolios || [];
  const limitedPortfolios = portfolios.slice(0, 3); // Only show latest 3 portfolios
  const hasMorePortfolios = portfolios.length > 3;

  // If profile not found, redirect
  if (!portfolioManagerId) {
    router.push('/portfolio-managers');
    return null;
  }

  const handlePortfolioSuccess = async () => {
    await refetchProfile();
    setEditingProfile(null);
    setShowCreatePortfolioModal(false);
  };

  const handleViewAllPortfolios = () => {
    router.push(`/portfolio-managers/${portfolioManagerId}/portfolios`);
  };

  // Don't render anything until profile data is loaded
  if (profileLoading || !profile) {
    return <FullPageLoader message="Loading portfolio manager profile..." />;
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Profile Header */}
          <ProfileHeader profile={profile} isOwner={session?.userId === profile?.userId} onEditClick={() => setEditingProfile(profile)} />

          {/* Portfolios Section */}
          <PortfolioCards
            portfolios={limitedPortfolios}
            portfolioManagerId={portfolioManagerId}
            isOwner={session?.userId === profile?.userId}
            onCreatePortfolio={() => setShowCreatePortfolioModal(true)}
          />

          {/* View All Portfolios Button */}
          {hasMorePortfolios && (
            <div className="mt-8 text-center">
              <button
                onClick={handleViewAllPortfolios}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                View All Portfolios ({portfolios.length})
              </button>
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {editingProfile && (
          <AddEditPortfolioProfileModal
            isOpen={!!editingProfile}
            onClose={() => setEditingProfile(null)}
            portfolioManagerProfile={editingProfile as PortfolioManagerProfile}
            onSuccess={handlePortfolioSuccess}
            isAdmin={false} // Users cannot see admin fields
          />
        )}

        {/* Create Portfolio Modal */}
        {showCreatePortfolioModal && (
          <AddEditPortfolioModal
            isOpen={showCreatePortfolioModal}
            onClose={() => setShowCreatePortfolioModal(false)}
            onSuccess={handlePortfolioSuccess}
            portfolioManagerId={portfolioManagerId}
          />
        )}
      </div>
    </PageWrapper>
  );
}
