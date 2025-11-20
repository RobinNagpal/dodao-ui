'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { PortfolioManagerProfile } from '@prisma/client';
import { CreatePortfolioManagerProfileRequest, UpdatePortfolioManagerProfileRequest } from '@/types/portfolio';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { parseMarkdown } from '@/util/parse-markdown';

export default function PortfolioManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch existing portfolio manager profile
  const {
    data: profileData,
    loading: profileLoading,
    reFetchData: refetchProfile,
  } = useFetchData<{ portfolioManagerProfile: PortfolioManagerProfile | null }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profile`,
    { skipInitialFetch: !session },
    'Failed to fetch portfolio manager profile'
  );

  const { postData: createProfile, loading: isCreating } = usePostData<PortfolioManagerProfile, CreatePortfolioManagerProfileRequest>({
    successMessage: 'Portfolio manager profile created successfully!',
    errorMessage: 'Failed to create portfolio manager profile.',
  });

  const { putData: updateProfile, loading: isUpdating } = usePutData<PortfolioManagerProfile, UpdatePortfolioManagerProfileRequest>({
    successMessage: 'Portfolio manager profile updated successfully!',
    errorMessage: 'Failed to update portfolio manager profile.',
  });

  const existingProfile = profileData?.portfolioManagerProfile;

  // Populate form when profile loads
  useEffect(() => {
    if (existingProfile) {
      setHeadline(existingProfile.headline);
      setSummary(existingProfile.summary);
      setDetailedDescription(existingProfile.detailedDescription);
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!headline.trim() || !summary.trim() || !detailedDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (existingProfile) {
        // Update existing profile
        const updateData: UpdatePortfolioManagerProfileRequest = {
          headline: headline.trim(),
          summary: summary.trim(),
          detailedDescription: detailedDescription.trim(),
        };

        await updateProfile(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profile`, updateData);
        await refetchProfile();
        setIsEditing(false);
      } else {
        // Create new profile
        const createData: CreatePortfolioManagerProfileRequest = {
          headline: headline.trim(),
          summary: summary.trim(),
          detailedDescription: detailedDescription.trim(),
        };

        await createProfile(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/portfolio-manager-profile`, createData);
        await refetchProfile();
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    if (existingProfile) {
      // Reset to original values and exit edit mode
      setHeadline(existingProfile.headline);
      setSummary(existingProfile.summary);
      setDetailedDescription(existingProfile.detailedDescription);
      setIsEditing(false);
    } else {
      // Clear form
      setHeadline('');
      setSummary('');
      setDetailedDescription('');
    }
  };

  // Show loading or redirect if no session
  if (!session || profileLoading) {
    return <FullPageLoader message="Loading portfolio manager profile..." />;
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Portfolio Manager Profile</h1>
          <p className="mt-2 text-gray-400">
            {existingProfile
              ? 'Update your portfolio manager profile to showcase your investment philosophy and track record.'
              : 'Create your portfolio manager profile to showcase your investment philosophy and track record.'
            }
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg">
          {existingProfile && !isEditing ? (
            // Display mode for existing profile
            <div className="bg-gray-900 space-y-6 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{existingProfile.headline}</h2>
                  <p className="mt-2 text-gray-300">{existingProfile.summary}</p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  className="px-4 py-2"
                >
                  Update Profile
                </Button>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Background & Experience</h3>
                <div className="prose prose-invert markdown markdown-body max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(existingProfile.detailedDescription) }} />
                </div>
              </div>
            </div>
          ) : (
            // Edit/Create form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {existingProfile ? 'Update Profile' : 'Create Portfolio Manager Profile'}
                </h2>
                {existingProfile && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      handleCancel();
                    }}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="headline" className="text-white">
                  Professional Headline *
                </Label>
                <Input
                  id="headline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Value Investor | Long-term Growth Strategist"
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-sm text-gray-400">
                  A brief professional title that describes your investment approach
                </p>
              </div>

              <div>
                <Label htmlFor="summary" className="text-white">
                  Investment Philosophy Summary *
                </Label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe your investment philosophy, approach, and key principles..."
                  className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  rows={4}
                  required
                />
                <p className="mt-1 text-sm text-gray-400">
                  A concise summary of your investment approach and philosophy
                </p>
              </div>

              <div>
                <MarkdownEditor
                  id="detailed-description"
                  objectId="portfolio-profile"
                  label="Detailed Background & Experience *"
                  modelValue={detailedDescription}
                  placeholder="Provide detailed information about your investment background, experience, track record, and any other relevant information..."
                  onUpdate={setDetailedDescription}
                  maxHeight={500}
                  info="Use markdown formatting to structure your content. Include your investment experience, notable achievements, and market outlook."
                />
                </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="contained"
                  primary
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2"
                >
                  {isCreating || isUpdating
                    ? 'Saving...'
                    : existingProfile
                      ? 'Update Profile'
                      : 'Create Profile'
                  }
                </Button>

                {(headline !== (existingProfile?.headline || '') ||
                  summary !== (existingProfile?.summary || '') ||
                  detailedDescription !== (existingProfile?.detailedDescription || '')) && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
