import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import SpaceCollections from '@/components/spaces/SpaceCollections/SpaceCollections';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import fetchDataServerSide from '@dodao/web-core/ui/hooks/useServerFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Space } from '@prisma/client';
import { getServerSession } from 'next-auth';
import React from 'react';
import { Session } from '@dodao/web-core/types/auth/Session';

async function SpaceCollectionsPage() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  const fetchedSpaces = await fetchDataServerSide<Space[]>(`${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator`);

  if (!session || !fetchedSpaces) {
    throw Error('Session or fetched spaces not found');
  }

  return (
    <PageWrapper>
      <SpaceCollections spacesByCreator={fetchedSpaces} />
    </PageWrapper>
  );
}

export default SpaceCollectionsPage;
