import ByteCollectionCardAddItem from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAddItem';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';

export default function AddNewItemButton({
  isAdmin,
  space,
  byteCollection,
}: {
  isAdmin: boolean;
  space: SpaceWithIntegrationsFragment;
  byteCollection: ByteCollectionSummary;
}) {
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);

  return (
    <>
      {isAdmin && (
        <Button
          className="rounded-lg text-color"
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
          + Add New Item
        </Button>
      )}
      <FullPageModal className={'w-1/2'} open={showCreateModal} onClose={() => setShowCreateModal(false)} title={'Create New Item'} showCloseButton={false}>
        <ByteCollectionCardAddItem space={space} hideModal={() => setShowCreateModal(false)} byteCollection={byteCollection} />
      </FullPageModal>
    </>
  );
}
