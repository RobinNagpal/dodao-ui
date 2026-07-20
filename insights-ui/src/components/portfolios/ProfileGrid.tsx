import { PortfolioManagerProfileWithUser } from '@/app/api/[spaceId]/portfolio-managers/type/[type]/route';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
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
    return <EmptyStateCard icon={emptyStateConfig.icon} title={emptyStateConfig.title} description={emptyStateConfig.description} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {profiles.map((profile) => (
        <Link
          key={profile.id}
          href={`/portfolio-managers/profile-details/${profile.id}`}
          className="group bg-surface rounded-2xl overflow-hidden transition-all flex gap-6 p-6 border border-border hover:border-blue-500"
        >
          {/* Profile Image - Large on Left */}
          <div className="flex-shrink-0">
            {profile.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt={`${profile.user.name}'s profile`}
                className="w-40 h-48 rounded-xl object-cover"
                width={160}
                height={192}
                unoptimized
              />
            ) : (
              <div className="w-40 h-48 bg-surface-2 rounded-xl flex items-center justify-center">
                <UserIcon className="w-16 h-16 text-muted" />
              </div>
            )}
          </div>

          {/* Content on Right */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Name and Headline */}
            <div className="mb-3">
              <h3 className="text-xl font-semibold text-heading group-hover:text-blue-400 transition-colors mb-1">{profile.user.name}</h3>
              <p className="text-blue-400 text-sm font-medium">{profile.headline}</p>
            </div>

            {/* Summary */}
            <p className="text-body text-sm leading-relaxed mb-4 line-clamp-4 flex-1">{profile.summary}</p>

            {/* Bottom Row - Country and View Profile */}
            <div className="flex items-center justify-between gap-3 mt-auto">
              {profile.country && (
                <div className="flex items-center text-sm text-muted">
                  <span>📍 {profile.country}</span>
                </div>
              )}

              {showCollegeAmbassadorBadge && (
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400">College Ambassador</span>
                </div>
              )}

              <div className="ml-auto">
                <span className="text-blue-400 group-hover:text-blue-300 transition-colors text-sm font-medium">View Profile →</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
