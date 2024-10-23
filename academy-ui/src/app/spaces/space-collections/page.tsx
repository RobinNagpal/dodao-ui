import SpaceCollections from '@/components/spaces/SpaceCollections/SpaceCollections';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import fetchDataServerSide from '@dodao/web-core/ui/hooks/useServerFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Space } from '@prisma/client';
import React from 'react';

async function SpaceCollectionsPage() {
  const space = (await getSpaceServerSide())!;
  const fetchedSpaces = await fetchDataServerSide<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator`);

  return (
    <PageWrapper>
      <SpaceCollections spacesByCreator={fetchedSpaces} />
    </PageWrapper>
  );
}

export default SpaceCollectionsPage;
