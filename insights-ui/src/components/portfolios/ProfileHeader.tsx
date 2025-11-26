import { UserIcon } from '@heroicons/react/24/outline';
import PortfolioManagerActions from '@/components/portfolios/PortfolioManagerActions';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { parseMarkdown } from '@/util/parse-markdown';

interface ProfileHeaderProps {
  profile: PortfolioManagerProfilewithPortfoliosAndUser | null;
  portfolioManagerId?: string;
}

export default function ProfileHeader({ profile, portfolioManagerId }: ProfileHeaderProps) {
  if (!profile) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {profile.profileImageUrl ? (
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
              <h1 className="text-3xl font-bold text-white mb-2">{profile.user.name}</h1>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xl text-blue-400">{profile.headline}</p>
                {portfolioManagerId && <PortfolioManagerActions profile={profile} portfolioManagerId={portfolioManagerId} />}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            {profile.country && (
              <div className="flex items-center gap-1">
                <span>📍 {profile.country}</span>
              </div>
            )}
            {profile.managerType && (
              <div className="flex items-center gap-1">
                <span>💼 {profile.managerType}</span>
              </div>
            )}
          </div>

          <p className="text-gray-300 mb-4">{profile.summary}</p>

          {profile.detailedDescription && (
            <div className="text-gray-300 markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(profile.detailedDescription) }} />
          )}
        </div>
      </div>
    </div>
  );
}
