import ByteCollectionCardAddItem from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAddItem';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { PlusIcon } from '@heroicons/react/24/solid';
import React from 'react';

export default function AddNewItemButton({
  isAdmin,
  space,
  byteCollection,
}: {
  isAdmin: boolean;
  space: SpaceWithIntegrationsDto;
  byteCollection: ByteCollectionSummary;
}) {
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);

  return (
    <>
      {isAdmin && (
        <Button
          className="text-color"
          variant="outlined"
          primary
          style={{
            border: '2px dotted',
            padding: '0.5rem',
            letterSpacing: '0.05em',
            borderRadius: '0.5rem',
          }}
          onClick={() => setShowCreateModal(true)}
        >
          <span>
            <PlusIcon className="h-5 w-5 mr-1" />
          </span>
          Add New Item
        </Button>
      )}
      <FullPageModal className={'w-1/2'} open={showCreateModal} onClose={() => setShowCreateModal(false)} title={'Create New Item'} showCloseButton={false}>
        <ByteCollectionCardAddItem space={space} hideModal={() => setShowCreateModal(false)} byteCollection={byteCollection} />
      </FullPageModal>
    </>
  );
}
