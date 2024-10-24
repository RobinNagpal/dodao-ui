import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionSummary;
  space: SpaceWithIntegrationsFragment;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, space }: ByteCollectionCardAdminDropdownProps) {
  const { showNotification } = useNotificationContext();
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);
  const router = useRouter();

  function onClose() {
    setShowEditCollectionModal(false);
    router.refresh();
  }

  const getThreeDotItems = (byteCollection: ByteCollectionSummary) => {
    if (byteCollection.hasOwnProperty('archived')) {
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Edit Seo', key: 'editSeo' },
        { label: 'Archive', key: 'archive' },
      ];
    }

    return [{ label: 'Edit', key: 'edit' }];
  };

  const onArchivedStatusChange = async (archived: boolean) => {
    try {
      if (archived) {
        showNotification({ message: 'ByteCollection archived successfully', type: 'success' });
      } else {
        showNotification({ message: 'ByteCollection un-archived successfully', type: 'success' });
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  };

  return (
    <>
      <PrivateEllipsisDropdown
        items={getThreeDotItems(byteCollection)}
        onSelect={async (key) => {
          if (key === 'edit') {
            setShowEditCollectionModal(true);
          }
          if (key === 'archive') {
            setShowDeleteModal(true);
          }
          if (key === 'unarchive') {
            onArchivedStatusChange(false);
          }
        }}
      />
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Byte Collection'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            onArchivedStatusChange(true);
            setShowDeleteModal(false);
          }}
        />
      )}

      {showEditCollectionModal && <ByteCollectionEditModal space={space} byteCollection={byteCollection} onClose={() => setShowEditCollectionModal(false)} />}
    </>
  );
}
