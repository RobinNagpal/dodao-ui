import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteCollectionFragment,
  ProjectByteCollectionFragment,
  ProjectFragment,
  useUpdateArchivedStatusOfProjectByteCollectionMutation,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  project?: ProjectFragment;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, byteCollectionType, project }: ByteCollectionCardAdminDropdownProps) {
  const router = useRouter();
  const { showNotification } = useNotificationContext();
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);

  const baseByteCollectionsEditUrl =
    byteCollectionType === 'projectByteCollection' ? `/projects/edit/${project?.id}/tidbit-collections` : '/tidbit-collections/edit';
  const getThreeDotItems = (byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment) => {
    if (byteCollection.hasOwnProperty('archived')) {
      if ((byteCollection as ProjectByteCollectionFragment).archived) {
        return [
          { label: 'Edit', key: 'edit' },
          { label: 'Unarchive', key: 'unarchive' },
        ];
      }
      return [
        { label: 'Edit', key: 'edit' },
        { label: 'Archive', key: 'archive' },
      ];
    }

    return [{ label: 'Edit', key: 'edit' }];
  };

  const [updateArchivedStatusOfProjectByteCollectionMutation] = useUpdateArchivedStatusOfProjectByteCollectionMutation();

  const onArchivedStatusChange = async (archived: boolean) => {
    try {
      await updateArchivedStatusOfProjectByteCollectionMutation({
        variables: {
          projectId: project!.id,
          byteCollectionId: byteCollection.id,
          archived: archived,
        },
        refetchQueries: ['ProjectByteCollections'],
      });
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
            router.push(`${baseByteCollectionsEditUrl}/${byteCollection.id}`);
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
    </>
  );
}
