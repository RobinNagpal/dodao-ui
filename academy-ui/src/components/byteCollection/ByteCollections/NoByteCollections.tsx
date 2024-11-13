import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Block from '@dodao/web-core/components/app/Block';
import React from 'react';

const NoByteCollections = ({ space }: { space: SpaceWithIntegrationsDto }) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="my-2 text-xl font-semibold">No Tidbits present for {space.name}</p>
      </Block>
    </div>
  );
};

export default NoByteCollections;
