import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import {
  TweetCollectionDto,
  TweetCollectionSummary,
} from '@/types/tweetCollections/tweetCollection';
import { CreateTweetCollectionRequest } from '@/types/request/TweetCollectionRequests';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import union from 'lodash/union';
import { getAdminKey } from '@/utils/auth/getAdminKey';

export default function AddNewItemButton({
  isAdmin,
  tweetCollection,
}: {
  isAdmin: boolean;
  tweetCollection: TweetCollectionSummary;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [upserting, setUpserting] = useState(false);
  const [handle, setHandle] = useState('');
  const redirectPath = '/';
  const { updateData: putData } = useUpdateData<
    TweetCollectionDto,
    CreateTweetCollectionRequest
  >(
    {
      headers: {
        'admin-key': getAdminKey(),
      },
    },
    {
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
      successMessage: 'Tweet collection updated successfully',
      errorMessage: 'Failed to create updated collection',
    },
    'PUT'
  );

  const handleAddHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpserting(true);
    const response = await putData(
      `${getBaseUrl()}/api/tweet-collections/${tweetCollection.id}`,
      {
        name: tweetCollection.name,
        description: tweetCollection.description,
        handles: union(tweetCollection.handles, [handle]),
        archive: tweetCollection.archive,
      }
    );

    setUpserting(false);
    if (response?.id) {
      setShowCreateModal(false);
    } else {
      alert('Failed to add handle.');
    }
  };
  return (
    <>
      {isAdmin && (
        <Button
          className="text-color"
          variant="outlined"
          primary
          style={{
            border: '1px solid',
            padding: '0.5rem',
            letterSpacing: '0.05em',
            borderRadius: '0.5rem',
          }}
          onClick={() => setShowCreateModal(true)}
        >
          <span>
            <PlusIcon className="h-5 w-5 mr-1" />
          </span>
          Add New Handle
        </Button>
      )}
      <SingleSectionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={'Add New Handle'}
        showSemiTransparentBg={true}
      >
        <div className="text-left py-4">
          <form onSubmit={handleAddHandleSubmit}>
            <Input
              id="handle"
              modelValue={handle}
              placeholder="@"
              onUpdate={(e) => (e ? setHandle(e.toString()) : setHandle(''))}
              required
              label={'Handle'}
            />
            <div className="w-full flex justify-center">
              <Button
                type="submit"
                primary
                variant={'contained'}
                className="mt-4"
                loading={upserting}
                disabled={upserting}
              >
                Add Handle
              </Button>
            </div>
          </form>
        </div>
      </SingleSectionModal>
    </>
  );
}
