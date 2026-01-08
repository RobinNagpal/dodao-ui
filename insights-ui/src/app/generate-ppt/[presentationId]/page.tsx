'use client';

import React, { useEffect, useState, use } from 'react';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import SlideRow from '@/components/presentations/SlideRow';
import SlideContentModal from '@/components/presentations/SlideContentModal';
import AddSlideModal from '@/components/presentations/AddSlideModal';
import {
  PresentationStatus,
  PresentationPreferences,
  Slide,
  SlidePreference,
  GenerateFinalVideoResponse,
  AddSlideResponse,
  UpdatePresentationResponse,
} from '@/types/presentation/presentation-types';

interface PresentationDetailPageProps {
  params: Promise<{ presentationId: string }>;
}

interface PresentationData {
  presentationId: string;
  status: PresentationStatus;
  preferences: PresentationPreferences | null;
}

export default function PresentationDetailPage({ params }: PresentationDetailPageProps) {
  const { presentationId } = use(params);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);

  // Modal state
  const [selectedSlide, setSelectedSlide] = useState<{
    slide: Slide | undefined;
    slideNumber: string;
  } | null>(null);

  // Fetch presentation data
  const { data, loading, reFetchData } = useFetchData<PresentationData>(
    `${getBaseUrl()}/api/presentations/${presentationId}`,
    {},
    'Failed to fetch presentation'
  );

  const status = data?.status;
  const preferences = data?.preferences;

  // Post hook for generating final video
  const { postData: generateFinalVideoApi } = usePostData<GenerateFinalVideoResponse, Record<string, never>>({
    successMessage: 'Final video generation started!',
    errorMessage: 'Failed to generate final video',
  });

  // Post hook for adding slides
  const { postData: addSlideApi } = usePostData<AddSlideResponse, { slide: Slide }>({
    successMessage: 'Slide added successfully!',
    errorMessage: 'Failed to add slide',
  });

  // Put hook for updating slides
  const { putData: updateSlideApi } = usePutData<UpdatePresentationResponse, { voice: string; slides: SlidePreference[] }>({
    successMessage: 'Slide updated successfully!',
    errorMessage: 'Failed to update slide',
  });

  // State for adding slides
  const [addingSlide, setAddingSlide] = useState(false);

  // Delete hook for presentation
  const { deleteData: deletePresentationApi, loading: deletingPresentation } = useDeleteData({
    successMessage: 'Presentation deleted successfully!',
    errorMessage: 'Failed to delete presentation',
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    reFetchData();
  };

  useEffect(() => {
    if (refreshKey > 0) {
      reFetchData();
    }
  }, [refreshKey, reFetchData]);

  const handleSlideUpdate = async (updatedSlide: Slide) => {
    if (!preferences || !selectedSlide) return;

    // Update the slide in preferences
    const updatedSlides = preferences.slides.map((sp) => (sp.slideNumber === selectedSlide.slideNumber ? { ...sp, slide: updatedSlide } : sp));

    const result = await updateSlideApi(`${getBaseUrl()}/api/presentations/${presentationId}`, {
      voice: preferences.voice,
      slides: updatedSlides,
    });

    if (result) {
      setSelectedSlide(null);
      handleRefresh();
    }
  };

  const handleGenerateFinalVideo = async () => {
    try {
      setGeneratingFinal(true);
      setError(null);

      const result = await generateFinalVideoApi(`${getBaseUrl()}/api/presentations/${presentationId}/final-video`, {});

      if (result) {
        handleRefresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleDeletePresentation = async () => {
    const result = await deletePresentationApi(`${getBaseUrl()}/api/presentations/${presentationId}`);
    if (result) {
      router.push('/generate-ppt');
    }
  };

  const handleAddSlide = async (slide: Slide) => {
    setAddingSlide(true);
    setError(null);

    console.log('Adding slide:', slide);

    const result = await addSlideApi(`${getBaseUrl()}/api/presentations/${presentationId}/slides`, { slide });

    if (result) {
      // Wait for the data to be refetched before continuing
      // This ensures the UI shows the new slide
      await reFetchData();
      console.log('Data refetched after adding slide');
    }

    setAddingSlide(false);
  };

  const allVideosReady = status?.slides?.every((s) => s.hasVideo) ?? false;

  const dropdownActions: EllipsisDropdownItem[] = [
    { key: 'add-slide', label: 'Add New Slide' },
    { key: 'delete-ppt', label: 'Delete Presentation' },
  ];

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-color">{presentationId}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{status?.slides?.length || 0} slides</p>
          </div>
          <div className="flex gap-3 items-center">
            <Button onClick={handleRefresh} variant="outlined" disabled={loading}>
              Refresh
            </Button>
            <Button onClick={() => setShowAddSlideModal(true)} variant="outlined" disabled={loading}>
              + Add Slide
            </Button>
            <EllipsisDropdown
              items={dropdownActions}
              className="px-2 py-2"
              onSelect={(key) => {
                if (key === 'add-slide') {
                  setShowAddSlideModal(true);
                } else if (key === 'delete-ppt') {
                  setShowDeleteModal(true);
                }
              }}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No Preferences State */}
        {!loading && !status?.hasPreferences && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">Presentation Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This presentation doesnt have any content yet.</p>
            <Button onClick={() => router.push('/generate-ppt')} variant="outlined">
              Go Back
            </Button>
          </div>
        )}

        {/* Slides List */}
        {!loading && status?.hasPreferences && status.slides && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Slides</h2>
              {status.slides.map((slideStatus) => (
                <SlideRow
                  key={slideStatus.slideNumber}
                  slideStatus={slideStatus}
                  presentationId={presentationId}
                  onViewContent={() =>
                    setSelectedSlide({
                      slide: slideStatus.slide,
                      slideNumber: slideStatus.slideNumber,
                    })
                  }
                  onRefresh={handleRefresh}
                />
              ))}
            </div>

            {/* Final Video Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Final Video</h2>
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {status.hasFinalVideo && status.finalVideoUrl ? (
                  <div>
                    <div className="mb-4">
                      <video
                        key={status.finalVideoLastModified} // Force remount when video is updated
                        controls
                        className="w-full max-w-2xl mx-auto rounded-lg"
                      >
                        <source src={status.finalVideoUrl} type="video/mp4" />
                      </video>
                    </div>
                    <div className="flex justify-center gap-3">
                      <a href={status.finalVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Download Video
                      </a>
                      <span className="text-gray-400">•</span>
                      <Button onClick={handleGenerateFinalVideo} variant="outlined" loading={generatingFinal} disabled={generatingFinal || !allVideosReady}>
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {allVideosReady
                        ? 'All slide videos are ready. Generate the final video.'
                        : 'Generate all slide videos first before creating the final video.'}
                    </p>
                    <Button
                      onClick={handleGenerateFinalVideo}
                      primary
                      variant="contained"
                      loading={generatingFinal}
                      disabled={generatingFinal || !allVideosReady}
                    >
                      Generate Final Video
                    </Button>
                    {!allVideosReady && (
                      <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                        {status.slides.filter((s) => !s.hasVideo).length} slide(s) still need videos
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Slide Content Modal */}
        {selectedSlide && (
          <SlideContentModal
            open={!!selectedSlide}
            onClose={() => setSelectedSlide(null)}
            slide={selectedSlide.slide}
            slideNumber={selectedSlide.slideNumber}
            onSave={handleSlideUpdate}
          />
        )}

        {/* Add Slide Modal */}
        <AddSlideModal
          open={showAddSlideModal}
          onClose={() => setShowAddSlideModal(false)}
          onSuccess={() => {
            setShowAddSlideModal(false);
            // Data is already refreshed in handleAddSlide, no need to refresh again
          }}
          presentationId={presentationId}
          loading={addingSlide}
          onAdd={handleAddSlide}
        />

        {/* Delete Presentation Modal */}
        <DeleteConfirmationModal
          title={`Delete "${presentationId}"?`}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeletePresentation}
          deleting={deletingPresentation}
          deleteButtonText="Delete Presentation"
          confirmationText="DELETE"
        />
      </div>
    </PageWrapper>
  );
}
