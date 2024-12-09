'use client';

import React, { useState } from 'react';
import {
  TweetCollectionDto,
  TweetCollectionSummary,
} from '@/types/tweetCollections/tweetCollection';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import BadgeWithRemove from '@dodao/web-core/components/core/badge/BadgeWithRemove';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import { CreateTweetCollectionRequest } from '@/types/request/TweetCollectionRequests';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getAdminKey } from '@/utils/auth/getAdminKey';
import { useRouter } from 'next/navigation';

interface RemoveBadgeModalState {
  isVisible: boolean;
  handle: string | null;
}

export default function Badges({
  isAdmin,
  tweetCollection,
}: {
  isAdmin: boolean;
  tweetCollection: TweetCollectionSummary;
}) {
  const router = useRouter();
  const [removeBadgeModalState, setRemoveBadgeModalState] =
    useState<RemoveBadgeModalState>({
      isVisible: false,
      handle: null,
    });

  const { updateData: removeBadge, loading: removeBadgeLoading } =
    useUpdateData<TweetCollectionDto, CreateTweetCollectionRequest>(
      {
        headers: {
          'admin-key': getAdminKey(),
        },
      },
      {
        successMessage: 'Handle deleted Successfully',
        errorMessage: 'Failed to delete the handle. Please try again.',
      },
      'PUT'
    );

  const handleRemoveBadge = async () => {
    if (!removeBadgeModalState.handle) return;

    try {
      const updatedHandles = tweetCollection.handles.filter(
        (h) => h !== removeBadgeModalState.handle
      );

      await removeBadge(
        `${getBaseUrl()}/api/tweet-collections/${tweetCollection.id}`,
        {
          name: tweetCollection.name,
          description: tweetCollection.description,
          handles: updatedHandles,
          archive: tweetCollection.archive,
        }
      );
      closeRemoveBadgeModal();
      router.refresh();
    } catch (error) {
      console.error('Failed to remove badge:', error);
    }
  };

  function openRemoveBadgeModal(handle: string) {
    setRemoveBadgeModalState({
      isVisible: true,
      handle,
    });
  }

  function closeRemoveBadgeModal() {
    setRemoveBadgeModalState({
      isVisible: false,
      handle: null,
    });
  }

  return (
    <div>
      {tweetCollection.handles.map((handle, index) => (
        <BadgeWithRemove
          id={handle}
          key={index}
          label={handle}
          onRemove={() => openRemoveBadgeModal(handle)}
          isAdmin={isAdmin}
          onClick={() => {
            window.open(
              `https://x.com/${handle}`,
              '_blank',
              'noopener,noreferrer'
            );
          }}
        />
      ))}
      {removeBadgeModalState.isVisible && (
        <SingleSectionModal
          open={removeBadgeModalState.isVisible}
          onClose={closeRemoveBadgeModal}
          title="Delete Handle"
          showSemiTransparentBg={true}
        >
          <div className="p-4">
            <p className="mb-4">{`Are you sure you want to delete the handle "${removeBadgeModalState.handle}"?`}</p>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={handleRemoveBadge}
                loading={removeBadgeLoading}
                variant="contained"
                primary
                disabled={removeBadgeLoading}
              >
                OK
              </Button>
              <Button
                onClick={closeRemoveBadgeModal}
                disabled={removeBadgeLoading}
                variant="outlined"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SingleSectionModal>
      )}
    </div>
  );
}
