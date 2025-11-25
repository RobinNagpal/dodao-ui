import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/country/[country]/route';
import { UserIcon, FolderIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProfileGridProps {
  profiles: PortfolioManagerProfileWithUser[];
  emptyStateConfig: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  };
  showCollegeAmbassadorBadge?: boolean;
}

export default function ProfileGrid({ profiles, emptyStateConfig, showCollegeAmbassadorBadge = false }: ProfileGridProps) {
  if (profiles.length === 0) {
    const EmptyIcon = emptyStateConfig.icon;
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <EmptyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{emptyStateConfig.title}</h3>
        <p className="text-gray-400">{emptyStateConfig.description}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <Link key={profile.id} href={`/portfolio-managers/${profile.id}`} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-750 transition-colors block">
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
              {showCollegeAmbassadorBadge && (
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">College Ambassador</span>
                </div>
              )}
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
  );
}
