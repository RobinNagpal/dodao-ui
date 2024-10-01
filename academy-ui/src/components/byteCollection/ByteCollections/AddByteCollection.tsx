'use client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useRouter } from 'next/navigation';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();

  function onClose() {
    setShowAddCollectionModal(false);
    router.refresh();
  }

  async function upsertByteCollectionFn(byteCollection: EditByteCollection) {
    try {
      const result = await fetch(`${getBaseUrl()}/api/${space.id}/byte-collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            spaceId: space.id,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: [],
            status: byteCollection.status,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
        }),
      });

      if (result.ok) {
        showNotification({ message: 'Collection Created Successfully', type: 'success' });
        setShowAddCollectionModal(false);
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <Button
          className="w-full bg-white text-color font-semibold"
          variant="outlined"
          primary
          style={{ border: '2px dotted', height: '10rem', letterSpacing: '0.05em', borderRadius: '0.5rem' }}
          onClick={() => setShowAddCollectionModal(true)}
        >
          + Add Tidbit Collection
        </Button>
      </div>

      {showAddCollectionModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit Collection'}>
          <div className="text-left">
            <PageWrapper>
              <SingleCardLayout>
                <ByteCollectionEditor
                  space={space}
                  byteCollection={undefined}
                  viewByteCollectionsUrl={'/tidbit-collections'}
                  upsertByteCollectionFn={upsertByteCollectionFn}
                />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </>
  );
}
