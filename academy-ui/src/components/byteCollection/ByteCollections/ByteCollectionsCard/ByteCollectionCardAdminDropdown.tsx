import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import SortByteCollectionItemsModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/SortByteCollectionItemsModal';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionDto, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';

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

  const { updateData: unarchiveTidbitCollection, loading: unarchiveTidbitCollectionLoading } = useUpdateData<ByteCollectionDto, CreateByteCollectionRequest>(
    {},
    {
      successMessage: 'Tidbit Collection Unachived Successfully',
      errorMessage: 'Failed to unarchive the Tidbit Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: archiveTidbitCollection, loading: archiveTidbitCollectionLoading } = useUpdateData<ByteCollectionDto, CreateByteCollectionRequest>(
    {},
    {
      successMessage: 'Tidbit Collection Unarchived Successfully',
      errorMessage: 'Failed to archive the Tidbit Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const getThreeDotItems = () => {
    return [
      { label: 'Edit', key: 'edit' },
      { label: archive ? 'Unarchive' : 'Archive', key: archive ? 'unarchive' : 'archive' },
      { label: 'Sort Items', key: 'sortItems' },
    ];
  };

  const onArchive = async () => {
    await archiveTidbitCollection(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}`, {
      name: byteCollection.name,
      description: byteCollection.description,
      order: byteCollection.order,
      videoUrl: byteCollection.videoUrl,
      archive: true,
    });
  };

  const onUnarchive = async () => {
    await unarchiveTidbitCollection(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}`, {
      name: byteCollection.name,
      description: byteCollection.description,
      order: byteCollection.order,
      videoUrl: byteCollection.videoUrl,
      archive: false,
    });
  };

  return (
    <>
      <PrivateEllipsisDropdown
        space={space}
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
          deleting={archiveTidbitCollectionLoading}
          deleteButtonText={'Archive Byte Collection'}
        />
      )}

      {showUnarchiveModal && (
        <UnarchiveConfirmationModal
          title={`Unarchive Tidbit Collection - ${byteCollection.name}`}
          open={showUnarchiveModal}
          onClose={() => setShowUnarchiveModal(false)}
          onUnarchive={async () => {
            await onUnarchive();
            setShowUnarchiveModal(false);
          }}
          unarchiving={unarchiveTidbitCollectionLoading}
          unarchiveButtonText={'Unarchive Tidbit Collection'}
        />
      )}

      {showEditCollectionModal && <ByteCollectionEditModal space={space} byteCollection={byteCollection} onClose={() => setShowEditCollectionModal(false)} />}

      {showSortByteCollectionItemsModal && (
        <SortByteCollectionItemsModal space={space} byteCollection={byteCollection} onClose={() => setShowSortByteCollectionItemsModal(false)} />
      )}
    </>
  );
}
