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

  const uniqueSpacesByAdmin = spacesByAdmin.filter((adminSpace) => !spacesByCreator.some((creatorSpace) => creatorSpace.id === adminSpace.id));

  return (
    <PageWrapper>
      <SpaceCollections spacesByCreator={spacesByCreator} spacesByAdmin={uniqueSpacesByAdmin} />
    </PageWrapper>
  );
}

export default SpaceCollectionsPage;
