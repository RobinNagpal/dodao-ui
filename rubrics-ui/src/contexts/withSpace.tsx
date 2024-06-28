import { useSpace } from '@/contexts/SpaceContext';
import { Space } from '@prisma/client';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import React, { FC } from 'react';

export interface SpaceProps {
  space: Space;
}

function withSpace<P extends SpaceProps>(WrappedComponent: React.ComponentType<P & SpaceProps>): React.FC<Omit<P, 'space'>> {
  const SpaceHOC: FC<Omit<P, 'space'>> = (props) => {
    const { space } = useSpace();

    return space ? <WrappedComponent {...(props as P)} space={space} /> : <FullPageLoader />;
  };

  return SpaceHOC;
}

export default withSpace;
