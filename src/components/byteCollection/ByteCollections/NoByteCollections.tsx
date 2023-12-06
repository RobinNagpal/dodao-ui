import Block from '@/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

const NoByteCollections = ({ spaceOrProjectName }: { spaceOrProjectName: string }) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Tidbits present for {spaceOrProjectName}</p>
      </Block>
    </div>
  );
};

export default NoByteCollections;
