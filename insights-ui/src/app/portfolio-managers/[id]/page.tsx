'use client';

import AddEditPortfolioProfileModal from '@/components/portfolios/AddEditPortfolioProfileModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import { Portfolio, PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PencilIcon, TrashIcon, FolderIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
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
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<Portfolio | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const { deleteData: deletePortfolio, loading: isDeleting } = useDeleteData({
    successMessage: 'Portfolio deleted successfully!',
    errorMessage: 'Failed to delete portfolio.',
  });

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

  const handleDelete = async () => {
    if (!deletingPortfolio) return;

    const result = await deletePortfolio(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolios?id=${deletingPortfolio.id}`);
    if (result) {
      await refetchProfile();
      setDeletingPortfolio(null);
    }
  };

  const handlePortfolioSuccess = async () => {
    await refetchProfile();
    setEditingProfile(null);
    setShowCreateModal(false);
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
                {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} • Total holdings across all portfolios
              </p>
            </div>

            {/* Users cannot create portfolios - only admins can */}
          </div>

          {/* Portfolios Grid/List */}
          {portfolios.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No portfolios yet</h3>
              <p className="text-gray-400 mb-4">This portfolio manager hasnt published any portfolios yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{portfolio.name}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{portfolio.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button onClick={() => setEditingPortfolio(portfolio)} variant="text" className="text-blue-400 hover:text-blue-300 p-1">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setDeletingPortfolio(portfolio)} variant="text" className="text-red-400 hover:text-red-300 p-1">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-white">{portfolio.portfolioTickers?.length || 0}</span> holdings
                    </div>

                    {portfolio.portfolioTickers && portfolio.portfolioTickers.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300">Top Holdings:</div>
                        <div className="space-y-1">
                          {portfolio.portfolioTickers.slice(0, 3).map((ticker) => (
                            <div key={ticker.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-300">{ticker.tickerId || 'Unknown'}</span>
                              <span className="text-gray-400">{ticker.allocation}%</span>
                            </div>
                          ))}
                          {portfolio.portfolioTickers.length > 3 && (
                            <div className="text-sm text-gray-500">+{portfolio.portfolioTickers.length - 3} more holdings</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-700">
                      <Link
                        href={`/portfolio-managers/${portfolioManagerId}/portfolios/${portfolio.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Delete Confirmation Modal */}
        {deletingPortfolio && (
          <DeleteConfirmationModal
            open={!!deletingPortfolio}
            onClose={() => setDeletingPortfolio(null)}
            onDelete={handleDelete}
            deleting={isDeleting}
            title={`Delete "${deletingPortfolio.name}"?`}
            deleteButtonText="Delete Portfolio"
            confirmationText="DELETE"
          />
        )}
      </div>
    </PageWrapper>
  );
}
