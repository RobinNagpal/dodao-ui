'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import React, { useState, useEffect } from 'react';
import { SlideStatus, Slide } from '@/types/presentation/presentation-types';

interface SlideRowProps {
  slideStatus: SlideStatus;
  presentationId: string;
  onViewContent: () => void;
  onRefresh: () => void;
}

type ActionType = 'audio' | 'image' | 'video' | 'all';

const SlideRow: React.FC<SlideRowProps> = ({
  slideStatus,
  presentationId,
  onViewContent,
  onRefresh,
}) => {
  const [loading, setLoading] = useState<ActionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for render status updates
  useEffect(() => {
    const hasRenderingItems =
      (slideStatus.imageStatus === 'rendering' && slideStatus.imageRenderId) ||
      (slideStatus.videoStatus === 'rendering' && slideStatus.videoRenderId);

    if (!hasRenderingItems) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check image render status
        if (slideStatus.imageStatus === 'rendering' && slideStatus.imageRenderId) {
          const response = await fetch(`/api/presentations/${presentationId}/render-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              renderId: slideStatus.imageRenderId,
            }),
          });
          const result = await response.json();
          if (result.done) {
            onRefresh(); // Trigger refresh to update UI
          }
        }

        // Check video render status
        if (slideStatus.videoStatus === 'rendering' && slideStatus.videoRenderId) {
          const response = await fetch(`/api/presentations/${presentationId}/render-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              renderId: slideStatus.videoRenderId,
            }),
          });
          const result = await response.json();
          if (result.done) {
            onRefresh(); // Trigger refresh to update UI
          }
        }
      } catch (err) {
        console.error('Error polling render status:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [slideStatus.imageStatus, slideStatus.videoStatus, slideStatus.imageRenderId, slideStatus.videoRenderId, presentationId, onRefresh]);

  const generateArtifact = async (action: ActionType) => {
    setLoading(action);
    setError(null);

    try {
      const response = await fetch(
        `/api/presentations/${presentationId}/slides/${slideStatus.slideNumber}?action=${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to generate ${action}`);
      }

      // Refresh parent to get updated status
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (exists: boolean, status?: string) => {
    if (status === 'rendering') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Rendering...
        </span>
      );
    }
    if (exists) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Ready
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Not generated
      </span>
    );
  };

  return (
    <div className="border rounded-lg p-4 mb-4 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Slide {slideStatus.slideNumber}</h3>
        <Button
          onClick={() => generateArtifact('all')}
          primary
          variant="contained"
          size="sm"
          loading={loading === 'all'}
          disabled={loading !== null}
        >
          Generate All
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
          {error}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Content Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Content</span>
            {getStatusBadge(!!slideStatus.slide)}
          </div>
          <div className="text-xs text-gray-500 mb-2 truncate">
            {slideStatus.slide?.title || 'No title'}
          </div>
          <Button onClick={onViewContent} variant="outlined" size="sm" className="w-full">
            View / Edit
          </Button>
        </div>

        {/* Audio Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Audio</span>
            {getStatusBadge(slideStatus.hasAudio)}
          </div>
          {slideStatus.hasAudio && slideStatus.audioUrl ? (
            <audio controls className="w-full h-8 mb-2">
              <source src={slideStatus.audioUrl} type="audio/mpeg" />
            </audio>
          ) : (
            <div className="h-8 mb-2 flex items-center text-xs text-gray-500">No audio</div>
          )}
          <Button
            onClick={() => generateArtifact('audio')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'audio'}
            disabled={loading !== null}
          >
            {slideStatus.hasAudio ? 'Regenerate' : 'Generate'}
          </Button>
        </div>

        {/* Image Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Image</span>
            {getStatusBadge(slideStatus.hasImage, slideStatus.imageStatus)}
          </div>
          {slideStatus.hasImage && slideStatus.imageUrl ? (
            <div className="mb-2">
              <img
                src={slideStatus.imageUrl}
                alt={`Slide ${slideStatus.slideNumber}`}
                className="w-full h-16 object-cover rounded"
              />
            </div>
          ) : (
            <div className="h-16 mb-2 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed rounded">
              No image
            </div>
          )}
          <Button
            onClick={() => generateArtifact('image')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'image'}
            disabled={loading !== null}
          >
            {slideStatus.hasImage ? 'Regenerate' : 'Generate'}
          </Button>
        </div>

        {/* Video Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Video</span>
            {getStatusBadge(slideStatus.hasVideo, slideStatus.videoStatus)}
          </div>
          {slideStatus.hasVideo && slideStatus.videoUrl ? (
            <div className="mb-2">
              <video controls className="w-full h-16 object-cover rounded">
                <source src={slideStatus.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="h-16 mb-2 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed rounded">
              No video
            </div>
          )}
          <Button
            onClick={() => generateArtifact('video')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'video'}
            disabled={loading !== null || !slideStatus.hasAudio}
            title={!slideStatus.hasAudio ? 'Audio required first' : undefined}
          >
            {slideStatus.hasVideo ? 'Regenerate' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlideRow;

