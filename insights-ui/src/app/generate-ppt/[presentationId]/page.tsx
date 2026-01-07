'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import SlideRow from '@/components/presentations/SlideRow';
import SlideContentModal from '@/components/presentations/SlideContentModal';
import {
  PresentationStatus,
  PresentationPreferences,
  Slide,
  SlideStatus,
} from '@/types/presentation/presentation-types';

interface PresentationDetailPageProps {
  params: Promise<{ presentationId: string }>;
}

export default function PresentationDetailPage({ params }: PresentationDetailPageProps) {
  const { presentationId } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<PresentationStatus | null>(null);
  const [preferences, setPreferences] = useState<PresentationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFinal, setGeneratingFinal] = useState(false);

  // Modal state
  const [selectedSlide, setSelectedSlide] = useState<{
    slide: Slide | undefined;
    slideNumber: string;
  } | null>(null);

  const fetchPresentationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/presentations/${presentationId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch presentation');
      }

      setStatus(data.status);
      setPreferences(data.preferences);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationData();
  }, [presentationId]);

  const handleSlideUpdate = async (updatedSlide: Slide) => {
    if (!preferences || !selectedSlide) return;

    try {
      // Update the slide in preferences
      const updatedSlides = preferences.slides.map((sp) =>
        sp.slideNumber === selectedSlide.slideNumber
          ? { ...sp, slide: updatedSlide }
          : sp
      );

      const response = await fetch(`/api/presentations/${presentationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: preferences.voice,
          slides: updatedSlides,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update slide');
      }

      // Refresh data
      fetchPresentationData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateFinalVideo = async () => {
    try {
      setGeneratingFinal(true);
      setError(null);

      const response = await fetch(`/api/presentations/${presentationId}/final-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate final video');
      }

      // Refresh to get updated status
      fetchPresentationData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingFinal(false);
    }
  };

  const allVideosReady = status?.slides?.every((s) => s.hasVideo) ?? false;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.push('/generate-ppt')}
              className="text-sm text-blue-500 hover:underline mb-2 flex items-center gap-1"
            >
              ← Back to Presentations
            </button>
            <h1 className="text-3xl font-bold text-color">{presentationId}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {status?.slides?.length || 0} slides
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchPresentationData} variant="outlined" disabled={loading}>
              Refresh
            </Button>
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This presentation doesn't have any content yet.
            </p>
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
                  onRefresh={fetchPresentationData}
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
                      <video controls className="w-full max-w-2xl mx-auto rounded-lg">
                        <source src={status.finalVideoUrl} type="video/mp4" />
                      </video>
                    </div>
                    <div className="flex justify-center gap-3">
                      <a
                        href={status.finalVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Download Video
                      </a>
                      <span className="text-gray-400">•</span>
                      <Button
                        onClick={handleGenerateFinalVideo}
                        variant="outlined"
                        loading={generatingFinal}
                        disabled={generatingFinal || !allVideosReady}
                      >
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
                        {status.slides.filter((s) => !s.hasVideo).length} slide(s) still need
                        videos
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
      </div>
    </PageWrapper>
  );
}

