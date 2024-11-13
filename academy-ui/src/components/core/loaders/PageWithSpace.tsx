'use client';

import { useSpace } from '@/contexts/SpaceContext';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

export default function PageWithSpace({ children }: { children: (space: SpaceWithIntegrationsDto) => JSX.Element }): JSX.Element {
  const { space } = useSpace();

  return space ? children(space) : <FullPageLoader />;
}
