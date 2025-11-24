'use client';

import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import { UserIcon, FolderIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useParams } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { PortfolioManagerProfile } from '@prisma/client';

interface PortfolioManagerProfileWithUser extends PortfolioManagerProfile {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  };
  _count: {
    portfolios: number;
  };
}

export default function CollegeAmbassadorsPage() {
  const params = useParams();
  const country = params.country as string;

  // Fetch portfolio managers with CollegeAmbassador type
  const { data: profilesData, loading: profilesLoading } = useFetchData<{ profiles: PortfolioManagerProfileWithUser[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/portfolio-managers/country/${country}?managerType=${PortfolioManagerType.CollegeAmbassador}`,
    { skipInitialFetch: !country },
    'Failed to fetch college ambassadors'
  );

  const profiles = profilesData?.profiles || [];

  if (profilesLoading) {
    return <FullPageLoader message="Loading college ambassadors..." />;
  }

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
          {profiles.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <AcademicCapIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No college ambassadors found</h3>
              <p className="text-gray-400">There are no college ambassadors from {country} yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/portfolio-managers/${profile.id}`}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors block"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {profile.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={`${profile.user.name}'s profile`} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white mb-1 truncate">{profile.user.name}</h3>
                      <p className="text-blue-400 text-sm mb-2 line-clamp-1">{profile.headline}</p>
                      <div className="flex items-center gap-1">
                        <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">College Ambassador</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{profile.summary}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <FolderIcon className="w-4 h-4" />
                        Portfolios
                      </span>
                      <span className="text-white font-medium">{profile._count.portfolios}</span>
                    </div>

                    {profile.country && (
                      <div className="flex items-center text-sm text-gray-400">
                        <span>📍 {profile.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Profile →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
