'use client';
import ByteCollectionEditModal from '@/components/byteCollection/ByteCollections/ByteCollectionEditModal';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { PlusIcon } from '@heroicons/react/20/solid';
import React from 'react';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsDto }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);

  return (
    <div className="w-full flex justify-center mx-auto my-4">
      <Button
        className="w-full text-color font-semibold"
        variant="outlined"
        primary
        style={{ border: '2px dotted', height: '10rem', letterSpacing: '0.08em', borderRadius: '0.5rem' }}
        onClick={() => setShowAddCollectionModal(true)}
      >
        <span>
          <PlusIcon className="h-5 w-5 mr-2" />
        </span>{' '}
        Add Tidbit Collection
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
