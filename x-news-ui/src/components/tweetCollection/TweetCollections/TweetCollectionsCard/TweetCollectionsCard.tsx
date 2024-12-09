'use client';

import AddNewItemButton from '@/components/tweetCollection/TweetCollections/TweetCollectionsCard/AddNewItemButton';
import TweetCollectionCardAdminDropdown from '@/components/tweetCollection/TweetCollections/TweetCollectionsCard/TweetCollectionCardAdminDropdown';
import { TweetCollectionSummary, TweetCollectionDto } from '@/types/tweetCollections/tweetCollection';
import { DeleteTweetItemRequest } from '@/types/request/TweetRequests';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import PrimaryColorBadge from '@dodao/web-core/components/core/badge/PrimaryColorBadge';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import React from 'react';
import styles from './TweetCollectionsCard.module.scss';
import { CreateTweetCollectionRequest } from '@/types/request/TweetCollectionRequests';
import Tweet from '@/components/tweet/Tweet';
import { TweetDto } from '@/types/tweets/tweet';
import RefreshButton from './TweetCollectionsCardRefreshButton';
import { getAdminKey } from '@/utils/auth/getAdminKey';
import BadgeWithRemove from '@dodao/web-core/components/core/badge/BadgeWithRemove';

interface TweetCollectionCardProps {
  tweetCollection: TweetCollectionSummary;
  isAdmin?: boolean | undefined;
  showArchived?: boolean;
}

interface DeleteItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemName: string | null;
  deleting: boolean;
}

interface UnarchiveItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemName: string | null;
  unarchiving: boolean;
}

export default function TweetCollectionsCard({ tweetCollection, isAdmin, showArchived }: TweetCollectionCardProps) {
  const [deleteItemModalState, setDeleteItemModalState] = React.useState<DeleteItemModalState>({
    isVisible: false,
    itemId: null,
    itemName: null,
    deleting: false,
  });
  const [unarchiveItemModalState, setUnarchiveItemModalState] = React.useState<UnarchiveItemModalState>({
    isVisible: false,
    itemId: null,
    itemName: null,
    unarchiving: false,
  });

  const [showUnarchiveModal, setShowUnarchiveModal] = React.useState<boolean>(false);

  const { showNotification } = useNotificationContext();

  const redirectPath = '/';

  const { updateData: archiveItem, loading: archiveItemLoading } = useUpdateData<TweetDto, DeleteTweetItemRequest>(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      successMessage: 'Tweet Archived Successfully',
      errorMessage: 'Failed to archive the tweet. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: unArchiveItem, loading: unArchiveItemLoading } = useUpdateData<TweetDto, DeleteTweetItemRequest>(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      successMessage: 'Tweet Unarchived Successfully',
      errorMessage: 'Failed to unarchive the tweet. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: unArchiveTweetCollection, loading: unArchiveTweetCollectionLoading } = useUpdateData<TweetCollectionDto, CreateTweetCollectionRequest>(
    {},
    {
      successMessage: 'Tweet Collection Unarchived Successfully',
      errorMessage: 'Failed to archive the Tweet Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const onUnarchive = async () => {
    await unArchiveTweetCollection(`${getBaseUrl()}/api/tweet-collections/${tweetCollection?.id}`, {
      name: tweetCollection.name,
      description: tweetCollection.description,
      handles: tweetCollection.handles,
      archive: false,
    });
  };

  const threeDotItems = [{ label: 'Archive', key: 'archive' }];

  const nonArchivedTweets = tweetCollection.tweets?.filter((item) => !item.archive);

  const tweetCollectionItems = showArchived && isAdmin ? tweetCollection.tweets : nonArchivedTweets;

  function openItemDeleteModal(itemId: string, itemName: string) {
    setDeleteItemModalState({
      isVisible: true,
      itemId: itemId,
      itemName: itemName,
      deleting: false,
    });
  }

  function openItemUnarchiveModal(itemId: string, itemName: string) {
    setUnarchiveItemModalState({
      isVisible: true,
      itemId: itemId,
      itemName,
      unarchiving: false,
    });
  }

  function closeItemDeleteModal() {
    setDeleteItemModalState({
      isVisible: false,
      itemId: null,
      itemName: null,
      deleting: false,
    });
  }

  function closeItemUnarchiveModal() {
    setUnarchiveItemModalState({
      isVisible: false,
      itemId: null,
      itemName: null,
      unarchiving: false,
    });
  }

  return (
    <div className={`border border-color rounded-xl overflow-hidden pl-4 pr-4 pt-4 pb-10 w-full my-5 ` + styles.cardDiv}>
      <div className="flex justify-between items-center">
        {tweetCollection.archive && isAdmin && <PrimaryColorBadge onClick={() => setShowUnarchiveModal(true)}>Archived</PrimaryColorBadge>}
        <div className="w-full flex justify-end items-center flex-row gap-4">
          <RefreshButton isAdmin={!!isAdmin} tweetCollection={tweetCollection} />
          <AddNewItemButton isAdmin={!!isAdmin} tweetCollection={tweetCollection} />
          <TweetCollectionCardAdminDropdown tweetCollection={tweetCollection} />
        </div>
      </div>

      <div className="mt-3 ml-2 text-xl">
        <div className={styles.headingColor}>{tweetCollection.name}</div>
        <div className="my-3 text-sm">{tweetCollection.description}</div>
      </div>
      <div>
        {tweetCollection.handles.map((handle, index) => (
          <a key={index} href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer">
            <BadgeWithRemove id={handle} label={handle} onRemove={() => {}} isAdmin={isAdmin} />
          </a>
        ))}
      </div>
      <div className="flow-root p-2">
        <ul role="list" className="-mb-8">
          {tweetCollectionItems?.map((tweet, tweetIndex) => (
            <Tweet
              key={tweetIndex}
              tweet={tweet}
              threeDotItems={threeDotItems}
              openItemDeleteModal={openItemDeleteModal}
              openItemUnarchiveModal={openItemUnarchiveModal}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      </div>

      {deleteItemModalState.isVisible && (
        <DeleteConfirmationModal
          title={`Archive Tweet by ${deleteItemModalState.itemName}`}
          deleteButtonText={`Archive Tweet`}
          open={deleteItemModalState.isVisible}
          onClose={closeItemDeleteModal}
          deleting={archiveItemLoading}
          onDelete={async () => {
            if (!deleteItemModalState.itemId || !deleteItemModalState.itemName) {
              showNotification({
                message: 'Some Error occurred',
                type: 'error',
              });
              closeItemDeleteModal();
              return;
            }
            await archiveItem(`${getBaseUrl()}/api/tweet-collections/${tweetCollection?.id}/tweets/${deleteItemModalState.itemId}`, {
              archive: true,
            });
            closeItemDeleteModal();
          }}
        />
      )}

      {unarchiveItemModalState.isVisible && (
        <UnarchiveConfirmationModal
          title={`Unarchive Tweet`}
          open={unarchiveItemModalState.isVisible}
          onClose={closeItemUnarchiveModal}
          unarchiving={unArchiveItemLoading}
          onUnarchive={async () => {
            if (!unarchiveItemModalState.itemId || !unarchiveItemModalState.itemName) {
              showNotification({
                message: 'Some Error occurred',
                type: 'error',
              });
              closeItemUnarchiveModal();
              return;
            }

            await unArchiveItem(`${getBaseUrl()}/api/tweet-collections/${tweetCollection?.id}/tweets/${unarchiveItemModalState.itemId}`, {
              archive: false,
            });
            closeItemUnarchiveModal();
          }}
        />
      )}

      {showUnarchiveModal && (
        <UnarchiveConfirmationModal
          title={`Unarchive Tweet Collection - ${tweetCollection.name}`}
          open={showUnarchiveModal}
          onClose={() => setShowUnarchiveModal(false)}
          onUnarchive={async () => {
            await onUnarchive();
            setShowUnarchiveModal(false);
          }}
          unarchiving={unArchiveTweetCollectionLoading}
          unarchiveButtonText={'Unarchive'}
        />
      )}
    </div>
  );
}
