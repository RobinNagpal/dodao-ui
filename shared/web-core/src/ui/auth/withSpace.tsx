import { SpaceWithIntegrationsFragment } from '@dodao/web-core/types/space';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { useSpace } from '@dodao/web-core/ui/contexts/SpaceContext';
import React, { FC } from 'react';

export interface SpaceProps {
  space: SpaceWithIntegrationsFragment;
}

function withSpace<P extends SpaceProps>(WrappedComponent: React.ComponentType<P & SpaceProps>): React.FC<Omit<P, 'space'>> {
  const SpaceHOC: FC<Omit<P, 'space'>> = (props) => {
    const { space } = useSpace();

    return space ? <WrappedComponent {...(props as P)} space={space} /> : <FullPageLoader />;
  };

  return SpaceHOC;
}

export default withSpace;