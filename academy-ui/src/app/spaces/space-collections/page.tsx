import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CollectionPageLoading from '@dodao/web-core/src/components/core/loaders/CollectionPageLoading';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Space } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';
import { useFetchUtils } from '@dodao/web-core/utils/api/useFetchUtils';

async function SpaceCollections() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  const { fetchData } = useFetchUtils();
  let spaces: Space[] = [];

  if (session) {
    const fetchedSpaces = await fetchData<Space[]>(
      `${getBaseUrl()}/api/${space.id}/queries/spaces/by-creator?username=${session.username}`,
      'Error while fetching spaces'
    );
    spaces = fetchedSpaces ?? [];
  }

  if (spaces.length === 0) {
    redirect('/spaces/create');
  }

  return (
    <PageWrapper>
      <Suspense fallback={<CollectionPageLoading />}>
        <SpaceCollectionsGrid spaceCollections={spaces} space={space} spaceCollectionsBaseUrl={`/spaces`} isAdmin={session?.isAdminOfSpace} />
      </Suspense>
    </PageWrapper>
  );
}

export default SpaceCollections;
