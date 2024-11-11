import SpaceCollections from '@/components/spaces/SpaceCollections/SpaceCollections';
import fetchDataServerSide from '@/utils/api/fetchDataServerSide';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Space } from '@prisma/client';
import React from 'react';

async function SpaceCollectionsPage() {
  const space = (await getSpaceServerSide())!;

  const [spacesByCreator, spacesByAdmin] = await Promise.all([
    fetchDataServerSide<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator`),
    fetchDataServerSide<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-admin`),
  ]);

  return (
    <PageWrapper>
      <SpaceCollections spacesByCreator={spacesByCreator} spacesByAdmin={spacesByAdmin} />
    </PageWrapper>
  );
}

export default SpaceCollectionsPage;
