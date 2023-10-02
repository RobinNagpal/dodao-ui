import Block from '@/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

const NoByteCollections = ({ space }: { space?: SpaceWithIntegrationsFragment }) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Tidbits present for {space?.name}</p>
      </Block>
    </div>
  );
};

export default NoByteCollections;
