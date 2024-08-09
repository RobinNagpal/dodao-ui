import Block from '@dodao/web-core/components/app/Block';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

const NoByteCollections = ({ space, isAdmin }: { space: SpaceWithIntegrationsFragment; isAdmin?: boolean | undefined }) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Tidbits present for {space.name}</p>
      </Block>
      {isAdmin! && (
        <div className="w-1/2">
          <AddByteCollection space={space} />
        </div>
      )}
    </div>
  );
};

export default NoByteCollections;
