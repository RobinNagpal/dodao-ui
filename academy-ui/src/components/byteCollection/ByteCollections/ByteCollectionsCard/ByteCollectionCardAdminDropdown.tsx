import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import SortByteCollectionItemsModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/SortByteCollectionItemsModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionDto, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionSummary;
  space: SpaceWithIntegrationsDto;
  archive?: boolean;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, space, archive }: ByteCollectionCardAdminDropdownProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);
  const [showSortByteCollectionItemsModal, setShowSortByteCollectionItemsModal] = React.useState<boolean>(false);

  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';
  const { deleteData, loading } = useDeleteData<ByteCollectionDto, {}>(
    {
      errorMessage: 'Failed to archive Tidbit Collection',
      successMessage: 'Tidbit Collection archived successfully',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );

  const { updateData, loading: updateLoading } = useUpdateData<ByteCollectionDto, {}>(
    {},
    {
      errorMessage: 'Failed to unarchive ByteCollection',
      successMessage: 'ByteCollection unarchived successfully',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'POST'
  );
  const getThreeDotItems = () => {
    return [
      { label: 'Edit', key: 'edit' },
      { label: archive ? 'Unarchive' : 'Archive', key: archive ? 'unarchive' : 'archive' },
      { label: 'Sort Items', key: 'sortItems' },
    ];
  };

  const onArchive = async () => {
    await deleteData(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}`);
  };

  const onUnarchive = async () => {
    await updateData(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}`);
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
          if (key === 'sortItems') {
            setShowSortByteCollectionItemsModal(true);
          }
        }}
      />
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Archive Byte Collection - ${byteCollection.name}`}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            await onArchive();
            setShowDeleteModal(false);
          }}
          deleting={loading}
          deleteButtonText={'Archive Byte Collection'}
        />
      )}

      {showUnarchiveModal && (
        <UnarchiveConfirmationModal
          title={`Unarchive Byte Collection - ${byteCollection.name}`}
          open={showUnarchiveModal}
          onClose={() => setShowUnarchiveModal(false)}
          onUnarchive={async () => {
            await onUnarchive();
            setShowUnarchiveModal(false);
          }}
          unarchiving={updateLoading}
          unarchiveButtonText={'Restore Byte Collection'}
        />
      )}

      {showEditCollectionModal && <ByteCollectionEditModal space={space} byteCollection={byteCollection} onClose={() => setShowEditCollectionModal(false)} />}

      {showSortByteCollectionItemsModal && (
        <SortByteCollectionItemsModal space={space} byteCollection={byteCollection} onClose={() => setShowSortByteCollectionItemsModal(false)} />
      )}
    </>
  );
}
