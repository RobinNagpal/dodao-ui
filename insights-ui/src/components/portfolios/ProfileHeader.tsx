import { PortfolioManagerProfile, User } from '@prisma/client';
import { UserIcon, PencilIcon } from '@heroicons/react/24/outline';
import Button from '@dodao/web-core/components/core/buttons/Button';

interface ProfileHeaderProps {
  profile: (PortfolioManagerProfile & { user: User }) | null;
  isOwner?: boolean;
  onEditClick?: () => void;
  showEditButton?: boolean;
}

export default function ProfileHeader({ profile, isOwner = false, onEditClick, showEditButton = true }: ProfileHeaderProps) {
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
              <p className="text-xl text-blue-400 mb-2">{profile.headline}</p>
            </div>
            {isOwner && showEditButton && onEditClick && (
              <Button onClick={onEditClick} variant="outlined" className="flex items-center gap-2 ml-4">
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
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

          {profile.detailedDescription && showEditButton && (
            <div className="text-gray-300 prose prose-invert max-w-none">
              <p>{profile.detailedDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
