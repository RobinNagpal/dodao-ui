import { UserIcon } from '@heroicons/react/24/outline';
import PortfolioManagerActions from '@/components/portfolios/PortfolioManagerActions';
import { PortfolioManagerProfilewithPortfoliosAndUser } from '@/types/portfolio';
import { parseMarkdown } from '@/util/parse-markdown';
import { PORTFOLIO_MANAGER_TYPE_LABELS, PortfolioManagerType } from '@/types/portfolio-manager';

interface ProfileHeaderProps {
  profile: PortfolioManagerProfilewithPortfoliosAndUser | null;
  portfolioManagerId?: string;
}

export default function ProfileHeader({ profile, portfolioManagerId }: ProfileHeaderProps) {
  if (!profile) return null;

  const totalPortfolios = profile.portfolios?.length || 0;
  const totalHoldings = profile.portfolios?.reduce((sum, p) => sum + (p.portfolioTickers?.length || 0), 0) || 0;

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden mb-8 border border-gray-800">
      <div className="flex flex-col md:flex-row gap-8 p-8">
        {/* Profile Image and Stats Section */}
        <div className="flex-shrink-0">
          {/* Profile Image */}
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={`${profile.user.name}'s profile`} className="w-48 h-56 rounded-xl object-cover mb-6" />
          ) : (
            <div className="w-48 h-56 bg-gray-700 rounded-xl flex items-center justify-center mb-6">
              <UserIcon className="w-24 h-24 text-gray-400" />
            </div>
          )}

          {/* Metadata Stats */}
          <div className="space-y-3 w-48">
            {profile.country && (
              <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                <span className="text-sm">📍</span>
                <span>{profile.country}</span>
              </div>
            )}
            {profile.managerType && (
              <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                <span className="text-sm">💼</span>
                <span>{PORTFOLIO_MANAGER_TYPE_LABELS[profile.managerType as PortfolioManagerType] || profile.managerType}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-sm">📂</span>
              <span>
                {totalPortfolios} Portfolio{totalPortfolios !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-sm">📊</span>
              <span>{totalHoldings} Total Holdings</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header with Name and Actions */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">{profile.user.name}</h1>
              <p className="text-xl text-blue-400 font-medium">{profile.headline}</p>
            </div>
            {portfolioManagerId && (
              <div className="ml-4">
                <PortfolioManagerActions profile={profile} portfolioManagerId={portfolioManagerId} />
              </div>
            )}
          </div>

          {/* Summary */}
          <p className="text-gray-300 text-sm leading-relaxed mb-5 mt-6">{profile.summary}</p>

          {/* Detailed Description */}
          {profile.detailedDescription && (
            <div
              className="text-gray-300 text-sm leading-relaxed markdown markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(profile.detailedDescription) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
