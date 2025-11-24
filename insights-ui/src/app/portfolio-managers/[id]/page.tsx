'use client';

import AddEditPortfolioProfileModal from '@/components/portfolios/AddEditPortfolioProfileModal';
import AddEditPortfolioModal from '@/components/portfolios/AddEditPortfolioModal';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PencilIcon, FolderIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import Button from '@dodao/web-core/components/core/buttons/Button';
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

  // Show loading or redirect if no session
  if (profileLoading) {
    return <FullPageLoader message="Loading portfolio manager profile..." />;
  }

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

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          {/* Profile Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {profile?.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={`${profile.user.name}'s profile`} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{profile?.user.name}</h1>
                    <p className="text-xl text-blue-400 mb-2">{profile?.headline}</p>
                  </div>
                  {session?.userId === profile?.userId && (
                    <Button onClick={() => setEditingProfile(profile!)} variant="outlined" className="flex items-center gap-2 ml-4">
                      <PencilIcon className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {profile?.country && (
                    <div className="flex items-center gap-1">
                      <span>📍 {profile.country}</span>
                    </div>
                  )}
                  {profile?.managerType && (
                    <div className="flex items-center gap-1">
                      <span>💼 {profile.managerType}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${profile?.isPublic ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {profile?.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{profile?.summary}</p>

                {profile?.detailedDescription && (
                  <div className="text-gray-300 prose prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: profile.detailedDescription.replace(/\n/g, '<br>') }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Portfolios Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FolderIcon className="w-6 h-6 text-blue-500" />
                Portfolios
              </h2>
              <p className="text-gray-400 mt-1">
                {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} published
              </p>
            </div>

            {session?.userId === profile?.userId && (
              <Button onClick={() => setShowCreatePortfolioModal(true)} variant="contained" primary className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Portfolio
              </Button>
            )}
          </div>

          {/* Portfolios Preview */}
          {portfolios.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No portfolios yet</h3>
              <p className="text-gray-400 mb-4">
                {session?.userId === profile?.userId
                  ? 'Start building your investment portfolio to showcase your expertise.'
                  : "This portfolio manager hasn't published any portfolios yet."}
              </p>
              {session?.userId === profile?.userId && (
                <Button onClick={() => setShowCreatePortfolioModal(true)} variant="contained" primary className="inline-flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Create Your First Portfolio
                </Button>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-gray-800 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Latest Portfolios</h3>
                  <Link
                    href={`/portfolio-managers/${portfolioManagerId}/portfolios`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                  >
                    See All Portfolios →
                  </Link>
                </div>

                <div className="space-y-3">
                  {portfolios.slice(0, 3).map((portfolio) => (
                    <Link
                      key={portfolio.id}
                      href={`/portfolio-managers/${portfolioManagerId}/portfolios/${portfolio.id}`}
                      className="block bg-gray-900 rounded-lg p-4 hover:bg-gray-850 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-white mb-1">{portfolio.name}</h4>
                          <p className="text-gray-400 text-sm line-clamp-1">{portfolio.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          <span className="font-medium text-white">{portfolio.portfolioTickers?.length || 0}</span> holdings
                        </span>
                        {portfolio.portfolioTickers && portfolio.portfolioTickers.length > 0 && (
                          <span className="text-gray-500">
                            Top:{' '}
                            {portfolio.portfolioTickers
                              .slice(0, 3)
                              .map((t) => t.tickerId)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {portfolios.length > 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                    <Link href={`/portfolio-managers/${portfolioManagerId}/portfolios`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      View all {portfolios.length} portfolios →
                    </Link>
                  </div>
                )}
              </div>
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
