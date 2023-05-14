import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { FC } from 'react';

export interface SpaceProps {
  space: SpaceWithIntegrationsFragment;
}

function withSpace<P extends object>(WrappedComponent: React.ComponentType<P & SpaceProps>) {
  const SpaceHOC: FC<P> = (props) => {
    const { space } = useSpace();

    return space ? <WrappedComponent {...(props as P)} space={space} /> : <FullPageLoader />;
  };

  return SpaceHOC;
}

export default withSpace;
