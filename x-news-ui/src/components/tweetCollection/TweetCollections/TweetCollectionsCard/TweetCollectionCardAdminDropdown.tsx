import TweetCollectionEditModal from '@/components/tweetCollection/TweetCollections/TweetCollectionEditModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { TweetCollectionDto, TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import { CreateTweetCollectionRequest } from '@/types/request/TweetCollectionRequests';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import { getAdminKey } from '@/utils/auth/getAdminKey';

interface TweetCollectionCardAdminDropdownProps {
  tweetCollection: TweetCollectionSummary;
  archive?: boolean;
}
export default function TweetCollectionCardAdminDropdown({ tweetCollection, archive }: TweetCollectionCardAdminDropdownProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);

  const redirectPath = '/';

  const { updateData: unarchiveTweetCollection, loading: unarchiveTweetCollectionLoading } = useUpdateData<TweetCollectionDto, CreateTweetCollectionRequest>(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      successMessage: 'Tweet Collection Unarchived Successfully',
      errorMessage: 'Failed to unarchive the Tweet Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: archiveTweetCollection, loading: archiveTweetCollectionLoading } = useUpdateData<TweetCollectionDto, CreateTweetCollectionRequest>(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      successMessage: 'Tweet Collection Unarchived Successfully',
      errorMessage: 'Failed to archive the Tweet Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const getThreeDotItems = () => {
    return [
      { label: 'Edit', key: 'edit' },
      {
        label: archive ? 'Unarchive' : 'Archive',
        key: archive ? 'unarchive' : 'archive',
      },
    ];
  };

  const onArchive = async () => {
    await archiveTweetCollection(`${getBaseUrl()}/api/tweet-collections/${tweetCollection?.id}`, {
      name: tweetCollection.name,
      description: tweetCollection.description,
      handles: tweetCollection.handles,
      archive: true,
    });
  };

  const onUnarchive = async () => {
    await unarchiveTweetCollection(`${getBaseUrl()}/api/tweet-collections/${tweetCollection?.id}`, {
      name: tweetCollection.name,
      description: tweetCollection.description,
      handles: tweetCollection.handles,
      archive: false,
    });
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems()}
        onSelect={async (key) => {
          if (key === 'edit') {
            setShowEditCollectionModal(true);
          }
          if (key === 'archive') {
            setShowDeleteModal(true);
          }
          if (key === 'unarchive') {
            setShowUnarchiveModal(true);
          }
        }}
      />
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Archive tweet Collection - ${tweetCollection.name}`}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            await onArchive();
            setShowDeleteModal(false);
          }}
          deleting={archiveTweetCollectionLoading}
          deleteButtonText={'Archive'}
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
          unarchiving={unarchiveTweetCollectionLoading}
          unarchiveButtonText={'Unarchive'}
        />
      )}

      {showEditCollectionModal && <TweetCollectionEditModal tweetCollection={tweetCollection} onClose={() => setShowEditCollectionModal(false)} />}
    </>
  );
}
