import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import SortByteCollectionItemsModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/SortByteCollectionItemsModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionDto, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionSummary;
  space: SpaceWithIntegrationsDto;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, space }: ByteCollectionCardAdminDropdownProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);
  const [showSortByteCollectionItemsModal, setShowSortByteCollectionItemsModal] = React.useState<boolean>(false);

  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';
  const { deleteData, loading } = useDeleteData<ByteCollectionDto, {}>(
    {
      errorMessage: 'Failed to archive ByteCollection',
      successMessage: 'ByteCollection archived successfully',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );
  const getThreeDotItems = () => {
    return [
      { label: 'Edit', key: 'edit' },
      { label: 'Archive', key: 'archive' },
      { label: 'Sort Items', key: 'sortItems' },
    ];
  };

  const onArchive = async () => {
    await deleteData(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}`);
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

      {showEditCollectionModal && <ByteCollectionEditModal space={space} byteCollection={byteCollection} onClose={() => setShowEditCollectionModal(false)} />}

      {showSortByteCollectionItemsModal && (
        <SortByteCollectionItemsModal space={space} byteCollection={byteCollection} onClose={() => setShowSortByteCollectionItemsModal(false)} />
      )}
    </>
  );
}
