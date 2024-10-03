import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import React, { FC } from 'react';

export interface SpaceProps {
  space: SpaceWithIntegrationsFragment;
}

/**
 * @deprecated - Use `getSpaceServerSide` instead and pass it down the tree. We are moving a bit away from context
 *  as its not good for server side components.
 *
 *  At the top pages, you can always use `getSpaceServerSide` to get the space using await in an async component
 *  and pass it down the tree. See `academy-ui/src/app/spaces/create/page.tsx` for an example.
 *
 * @param WrappedComponent
 */
function withSpace<P extends SpaceProps>(WrappedComponent: React.ComponentType<P & SpaceProps>): React.FC<Omit<P, 'space'>> {
  const SpaceHOC: FC<Omit<P, 'space'>> = (props) => {
    const { space } = useSpace();

    return space ? <WrappedComponent {...(props as P)} space={space} /> : <FullPageLoader />;
  };

  return SpaceHOC;
}

export default withSpace;
