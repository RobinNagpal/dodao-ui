'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState, useEffect, useRef } from 'react';
import { SlideStatus, GenerateArtifactResponse, RenderStatusResponse, UploadImageResponse } from '@/types/presentation/presentation-types';

interface SlideRowProps {
  slideStatus: SlideStatus;
  presentationId: string;
  onViewContent: () => void;
  onRefresh: () => void;
}

type ActionType = 'audio' | 'image' | 'video' | 'all';

const SlideRow: React.FC<SlideRowProps> = ({ slideStatus, presentationId, onViewContent, onRefresh }) => {
  const [loading, setLoading] = useState<ActionType | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { postData: generateArtifactApi, loading: generatingArtifact } = usePostData<GenerateArtifactResponse, Record<string, never>>({
    errorMessage: 'Failed to generate artifact',
  });

  const { postData: checkRenderStatus } = usePostData<RenderStatusResponse, { renderId: string }>({
    errorMessage: 'Failed to check render status',
  });

  const { postData: uploadImageApi } = usePostData<UploadImageResponse, FormData>({
    errorMessage: 'Failed to upload image',
  });

  const { deleteData: deleteSlideApi, loading: deletingSlide } = useDeleteData({
    successMessage: 'Slide deleted successfully!',
    errorMessage: 'Failed to delete slide',
  });

  // Poll for render status updates
  useEffect(() => {
    const hasRenderingItems =
      (slideStatus.imageStatus === 'rendering' && slideStatus.imageRenderId) || (slideStatus.videoStatus === 'rendering' && slideStatus.videoRenderId);

    if (!hasRenderingItems) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check image render status
        if (slideStatus.imageStatus === 'rendering' && slideStatus.imageRenderId) {
          const result = await checkRenderStatus(`${getBaseUrl()}/api/presentations/${presentationId}/render-status`, { renderId: slideStatus.imageRenderId });
          if (result?.done) {
            onRefresh();
          }
        }

        // Check video render status
        if (slideStatus.videoStatus === 'rendering' && slideStatus.videoRenderId) {
          const result = await checkRenderStatus(`${getBaseUrl()}/api/presentations/${presentationId}/render-status`, { renderId: slideStatus.videoRenderId });
          if (result?.done) {
            onRefresh();
          }
        }
      } catch (err) {
        console.error('Error polling render status:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [slideStatus.imageStatus, slideStatus.videoStatus, slideStatus.imageRenderId, slideStatus.videoRenderId, presentationId, onRefresh, checkRenderStatus]);

  const generateArtifact = async (action: ActionType) => {
    setLoading(action);
    setError(null);

    try {
      const result = await generateArtifactApi(`${getBaseUrl()}/api/presentations/${presentationId}/slides/${slideStatus.slideNumber}?action=${action}`, {});

      if (!result) {
        throw new Error(`Failed to generate ${action}`);
      }

      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadImageApi(`${getBaseUrl()}/api/presentations/${presentationId}/slides/${slideStatus.slideNumber}/upload-image`, formData);

      if (!result) {
        throw new Error('Failed to upload image');
      }

      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteSlide = async () => {
    const result = await deleteSlideApi(`${getBaseUrl()}/api/presentations/${presentationId}/slides/${slideStatus.slideNumber}`);
    if (result) {
      setShowDeleteModal(false);
      onRefresh();
    }
  };

  const getStatusBadge = (exists: boolean, status?: string) => {
    if (status === 'rendering') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Rendering...</span>;
    }
    if (exists) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ready</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Not generated</span>;
  };

  const dropdownActions: EllipsisDropdownItem[] = [
    { key: 'view-edit', label: 'View / Edit Content' },
    { key: 'delete', label: 'Delete Slide' },
  ];

  // Video generation requires both audio AND image
  const canGenerateVideo = slideStatus.hasAudio && slideStatus.hasImage;
  const videoDisabledReason = !slideStatus.hasAudio ? 'Audio required first' : !slideStatus.hasImage ? 'Image required first' : undefined;

  return (
    <div className="border rounded-lg p-4 mb-4 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Slide {slideStatus.slideNumber}</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => generateArtifact('all')}
            primary
            variant="contained"
            size="sm"
            loading={loading === 'all'}
            disabled={loading !== null || generatingArtifact}
          >
            Generate All
          </Button>
          <EllipsisDropdown
            items={dropdownActions}
            className="px-2 py-2"
            onSelect={(key) => {
              if (key === 'view-edit') {
                onViewContent();
              } else if (key === 'delete') {
                setShowDeleteModal(true);
              }
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Content Grid - 5 columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Content Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Content</span>
            {getStatusBadge(!!slideStatus.slide)}
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
            <div>
              <audio controls className="w-full h-8 mb-2">
                <source src={slideStatus.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          ) : (
            <div className="h-8 mb-2 flex items-center text-xs text-gray-500">No audio</div>
          )}
          <Button
            onClick={() => generateArtifact('audio')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'audio'}
            disabled={loading !== null || generatingArtifact}
          >
            {slideStatus.hasAudio ? 'Regenerate' : 'Generate'}
          </Button>
        </div>

        {/* Upload Image Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Upload Image</span>
            {slideStatus.hasImage && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Custom</span>
            )}
          </div>
          {slideStatus.hasImage && slideStatus.imageUrl ? (
            <div className="mb-2 h-24">
              <img src={slideStatus.imageUrl} alt={`Slide ${slideStatus.slideNumber}`} className="w-full h-24 object-cover rounded" />
            </div>
          ) : (
            <div className="h-24 mb-2 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed rounded">No image</div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" className="hidden" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={uploadingImage}
            disabled={uploadingImage || loading !== null}
          >
            {slideStatus.hasImage ? 'Replace' : 'Upload'}
          </Button>
        </div>

        {/* Generate Image Column */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generate Image</span>
            {getStatusBadge(slideStatus.hasImage, slideStatus.imageStatus)}
          </div>
          {slideStatus.hasImage && slideStatus.imageUrl ? (
            <div className="mb-2 h-24">
              <img src={slideStatus.imageUrl} alt={`Slide ${slideStatus.slideNumber}`} className="w-full h-24 object-cover rounded" />
            </div>
          ) : (
            <div className="h-24 mb-2 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed rounded">No image</div>
          )}
          <Button
            onClick={() => generateArtifact('image')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'image'}
            disabled={loading !== null || generatingArtifact}
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
            <div className="mb-2 h-24">
              <video controls className="w-full h-24 object-cover rounded">
                <source src={slideStatus.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="h-24 mb-2 flex items-center justify-center text-xs text-gray-500 border-2 border-dashed rounded">No video</div>
          )}
          <Button
            onClick={() => generateArtifact('video')}
            variant="outlined"
            size="sm"
            className="w-full"
            loading={loading === 'video'}
            disabled={loading !== null || generatingArtifact || !canGenerateVideo}
          >
            {slideStatus.hasVideo ? 'Regenerate' : 'Generate'}
          </Button>
          {!canGenerateVideo && <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">{videoDisabledReason}</p>}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        title={`Delete Slide ${slideStatus.slideNumber}?`}
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteSlide}
        deleting={deletingSlide}
        deleteButtonText="Delete Slide"
        confirmationText="DELETE"
      />
    </div>
  );
};

export default SlideRow;
