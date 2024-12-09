'use client';

import React, { useState } from 'react';
import { TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { useRouter } from 'next/navigation';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';

const refreshURL = process.env.NEXT_PUBLIC_TWEET_COLLECTION_REFRESHER_URL?.toString() || '';

export default function RefreshButton({ isAdmin, tweetCollection }: { isAdmin: boolean; tweetCollection: TweetCollectionSummary }) {
  const [confirming, setConfirming] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setConfirming(true);
    try {
      const response = await fetch(`${refreshURL}/${tweetCollection.id}`);
      setConfirming(false);
      if (response.status === 200) {
        setShowConfirmationModal(false);
        alert(`Collection "${tweetCollection.name}" refreshed successfully.`);
        router.refresh();
      } else {
        // Failure: Show an error message
        const errorData = await response.json();
        alert(`Unable to refresh the collection "${tweetCollection.name}". Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error refreshing the collection:', error);
      alert(`Failed to refresh the collection "${tweetCollection.name}".`);
    }
  };

  return (
    <>
      {isAdmin && <IconButton iconName={IconTypes.Refresh} onClick={() => setShowConfirmationModal(true)} tooltip="Refresh Collection" />}
      {showConfirmationModal && (
        <SingleSectionModal
          open={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          title="Refresh Collection"
          showSemiTransparentBg={true}
        >
          <div className="p-4">
            <p className="mb-4">{`Are you sure you want to refresh the collection "${tweetCollection.name}"?`}</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={handleRefresh} loading={confirming} variant="contained" primary disabled={confirming}>
                OK
              </Button>
              <Button onClick={() => setShowConfirmationModal(false)} disabled={confirming} variant="outlined">
                Cancel
              </Button>
            </div>
          </div>
        </SingleSectionModal>
      )}
    </>
  );
}
