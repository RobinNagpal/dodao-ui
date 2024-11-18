import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import SortByteCollectionItemsModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/SortByteCollectionItemsModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionDto, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import React from 'react';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';

interface ByteCollectionCardAdminDropdownProps {
  byteCollection: ByteCollectionSummary;
  space: SpaceWithIntegrationsDto;
  archive?: boolean;
}
export default function ByteCollectionCardAdminDropdown({ byteCollection, space, archive }: ByteCollectionCardAdminDropdownProps) {
  const { putData } = useFetchUtils();
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = React.useState<boolean>(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = React.useState<boolean>(false);
  const [showSortByteCollectionItemsModal, setShowSortByteCollectionItemsModal] = React.useState<boolean>(false);
  const [updating, setUpdating] = React.useState<boolean>(false);

  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';
  const getThreeDotItems = () => {
    return [
      { label: 'Edit', key: 'edit' },
      { label: archive ? 'Unarchive' : 'Archive', key: archive ? 'unarchive' : 'archive' },
      { label: 'Sort Items', key: 'sortItems' },
    ];
  };

  const onArchive = async () => {
    setUpdating(true);
    await putData<ByteCollectionDto, CreateByteCollectionRequest>(
      `${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}`,
      {
        name: byteCollection.name,
        description: byteCollection.description,
        order: byteCollection.order,
        videoUrl: byteCollection.videoUrl,
        archive: true,
      },
      {
        redirectPath: `${redirectPath}?updated=${Date.now()}`,
        successMessage: 'Tidbit collection deleted successfully',
        errorMessage: 'Failed to delete collection',
      }
    );
    setUpdating(false);
  };

  const onUnarchive = async () => {
    setUpdating(true);
    await putData<ByteCollectionDto, CreateByteCollectionRequest>(
      `${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}`,
      {
        name: byteCollection.name,
        description: byteCollection.description,
        order: byteCollection.order,
        videoUrl: byteCollection.videoUrl,
        archive: false,
      },
      {
        redirectPath: `${redirectPath}?updated=${Date.now()}`,
        successMessage: 'Tidbit collection unarchived successfully',
        errorMessage: 'Failed to unarchive collection',
      }
    );
    setUpdating(false);
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
          deleting={updating}
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
          unarchiving={updating}
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
