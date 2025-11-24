'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useState, useEffect } from 'react';
import {
  CreatePortfolioManagerProfileRequest,
  UpdatePortfolioManagerProfileRequest
} from '@/types/portfolio';
import { PortfolioManagerType, PORTFOLIO_MANAGER_TYPE_LABELS } from '@/types/portfolio-manager';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface PortfolioManagerProfile {
  id: string;
  headline: string;
  summary: string;
  detailedDescription: string;
  country: string | null;
  managerType: PortfolioManagerType | null;
  isPublic: boolean;
  profileImageUrl: string | null;
}

interface AddEditPortfolioProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioManagerProfile?: PortfolioManagerProfile | null;
  onSuccess?: () => void;
  isAdmin?: boolean; // Controls which fields are shown
  onDelete?: () => void; // Callback for deleting profile
  userId?: string; // Target user ID for admin operations
}

export default function AddEditPortfolioProfileModal({ isOpen, onClose, portfolioManagerProfile, onSuccess, isAdmin = false, onDelete, userId }: AddEditPortfolioProfileModalProps) {

  // Form state for portfolio manager profiles
  const [headline, setHeadline] = useState<string>('');
  const [profileSummary, setProfileSummary] = useState<string>('');
  const [profileDetailedDescription, setProfileDetailedDescription] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [managerType, setManagerType] = useState<PortfolioManagerType | ''>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

  // Post and Put hooks for portfolio manager profiles
  const { postData: createProfile, loading: creatingProfile } = usePostData<any, CreatePortfolioManagerProfileRequest>({
    successMessage: 'Portfolio manager profile created successfully!',
    errorMessage: 'Failed to create portfolio manager profile.',
  });

  const { putData: updateProfile, loading: updatingProfile } = usePutData<any, UpdatePortfolioManagerProfileRequest>({
    successMessage: 'Portfolio manager profile updated successfully!',
    errorMessage: 'Failed to update portfolio manager profile.',
  });

  const loading = creatingProfile || updatingProfile;

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (portfolioManagerProfile) {
        // Load existing profile data
        setHeadline(portfolioManagerProfile.headline);
        setProfileSummary(portfolioManagerProfile.summary);
        setProfileDetailedDescription(portfolioManagerProfile.detailedDescription);
        setCountry(portfolioManagerProfile.country || '');
        setManagerType((portfolioManagerProfile.managerType as PortfolioManagerType) || '');
        setIsPublic(portfolioManagerProfile.isPublic);
        setProfileImageUrl(portfolioManagerProfile.profileImageUrl || '');
      } else {
        // Reset form for new profile
        setHeadline('');
        setProfileSummary('');
        setProfileDetailedDescription('');
        setCountry('');
        setManagerType('');
        setIsPublic(false);
        setProfileImageUrl('');
      }
    }
  }, [isOpen, portfolioManagerProfile]);

  const handleSave = async (): Promise<void> => {
    // Profile validation and saving
    if (!headline.trim() || !profileSummary.trim() || !profileDetailedDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (isAdmin && !managerType) {
      alert('Please select a manager type');
      return;
    }

    if (portfolioManagerProfile) {
      // Update existing profile
      const updateData: UpdatePortfolioManagerProfileRequest = {
        headline: headline.trim(),
        summary: profileSummary.trim(),
        detailedDescription: profileDetailedDescription.trim(),
        country: country.trim() || undefined,
        ...(isAdmin && { managerType: managerType || undefined }),
        ...(isAdmin && { isPublic }),
        profileImageUrl: profileImageUrl.trim() || undefined,
      };

      // Use the profile ID for updates
      const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/${portfolioManagerProfile.id}`;

      const result = await updateProfile(apiUrl, updateData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    } else {
      // Create new profile
      const createData: CreatePortfolioManagerProfileRequest = {
        headline: headline.trim(),
        summary: profileSummary.trim(),
        detailedDescription: profileDetailedDescription.trim(),
        country: country.trim() || undefined,
        managerType: managerType || undefined,
        isPublic,
        profileImageUrl: profileImageUrl.trim() || undefined,
      };

      // Always use by-user endpoint for creating profiles (admin only)
      const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profiles/by-user/${userId}`;

      const result = await createProfile(apiUrl, createData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const getModalTitle = () => {
    return portfolioManagerProfile ? 'Edit Portfolio Manager Profile' : 'Create Portfolio Manager Profile';
  };

  return (
    <>
      <FullPageModal open={isOpen} onClose={onClose} title={getModalTitle()} className="w-full max-w-2xl">
        <div className="px-6 py-4 space-y-6 text-left">
            <>
              {/* Headline */}
              <div className="space-y-2">
                <label htmlFor="headline" className="block text-sm font-medium text-left">
                  Headline *
                </label>
                <Input
                  id="headline"
                  modelValue={headline}
                  onUpdate={(value) => setHeadline(value?.toString() || '')}
                  placeholder="Enter professional headline"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Profile Summary */}
              <div className="space-y-2">
                <label htmlFor="profile-summary" className="block text-sm font-medium text-left">
                  Summary *
                </label>
                <textarea
                  id="profile-summary"
                  value={profileSummary}
                  onChange={(e) => setProfileSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief professional summary..."
                />
              </div>

              {/* Profile Detailed Description */}
              <div className="space-y-2">
                <label htmlFor="profile-description" className="block text-sm font-medium text-left">
                  Detailed Description *
                </label>
                <textarea
                  id="profile-description"
                  value={profileDetailedDescription}
                  onChange={(e) => setProfileDetailedDescription(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed professional background and investment philosophy..."
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-left">
                  Country
                </label>
                <Input
                  id="country"
                  modelValue={country}
                  onUpdate={(value) => setCountry(value?.toString() || '')}
                  placeholder="Enter country"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Manager Type - Admin only */}
              {isAdmin && (
                <div className="space-y-2">
                  <label htmlFor="managerType" className="block text-sm font-medium text-left">
                    Manager Type {portfolioManagerProfile ? '' : '*'}
                  </label>
                <select
                  id="managerType"
                  value={managerType}
                  onChange={(e) => setManagerType(e.target.value as PortfolioManagerType | '')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select manager type</option>
                  {Object.values(PortfolioManagerType).map((type) => (
                    <option key={type} value={type}>
                      {PORTFOLIO_MANAGER_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                </div>
              )}

              {/* Profile Image URL */}
              <div className="space-y-2">
                <label htmlFor="profileImageUrl" className="block text-sm font-medium text-left">
                  Profile Image URL
                </label>
                <Input
                  id="profileImageUrl"
                  modelValue={profileImageUrl}
                  onUpdate={(value) => setProfileImageUrl(value?.toString() || '')}
                  placeholder="Enter profile image URL"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Is Public - Admin only */}
              {isAdmin && (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">Public Profile</span>
                  </label>
                  <p className="text-sm text-gray-500">Make this portfolio manager profile visible to all users</p>
                </div>
              )}
            </>


          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-5 mt-2 border-t border-gray-700">
            {/* Delete button - only show for existing profiles */}
            <div>
              {portfolioManagerProfile && onDelete && (
                <Button
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={loading}
                  variant="text"
                  className="text-red-400 hover:text-red-300"
                >
                  Delete Profile
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={onClose} disabled={loading} variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || (!headline.trim() || !profileSummary.trim() || !profileDetailedDescription.trim() || (isAdmin && !portfolioManagerProfile && !managerType))}
                loading={loading}
                variant="contained"
                primary
              >
                {portfolioManagerProfile ? 'Update Profile' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </div>
      </FullPageModal>

      {/* Delete Confirmation Modal */}
      {portfolioManagerProfile && onDelete && (
        <DeleteConfirmationModal
          title="Delete Portfolio Manager Profile"
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onDelete={() => {
            onDelete!();
            setShowDeleteConfirmation(false);
          }}
          deleting={loading}
          deleteButtonText="Delete Profile"
          confirmationText="DELETE PROFILE"
        />
      )}
    </>
  );
}
