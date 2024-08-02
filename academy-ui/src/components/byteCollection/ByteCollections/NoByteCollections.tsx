import Block from '@dodao/web-core/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

const NoByteCollections = ({ spaceName }: { spaceName: string }) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Tidbits present for {spaceName}</p>
      </Block>
    </div>
  );
};

export default NoByteCollections;
