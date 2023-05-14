'use client';

import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export default function PageWithSpace({ children }: { children: (space: SpaceWithIntegrationsFragment) => JSX.Element }): JSX.Element {
  const { space } = useSpace();

  return space ? children(space) : <FullPageLoader />;
}
