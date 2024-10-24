'use client';
import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);

  return (
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
      {showAddCollectionModal && (
        <ByteCollectionEditModal
          space={space}
          byteCollection={undefined}
          onClose={() => {
            setShowAddCollectionModal(false);
          }}
        />
      )}
    </div>
  );
}
