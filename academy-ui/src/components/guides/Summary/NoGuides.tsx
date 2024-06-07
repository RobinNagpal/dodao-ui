import Block from '@dodao/web-core/components/app/Block';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface NoGuidesProps {
  space: SpaceWithIntegrationsFragment;
}
const NoGuides = ({ space }: NoGuidesProps) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No guides present for {space?.name}</p>
      </Block>
    </div>
  );
};

export default NoGuides;
