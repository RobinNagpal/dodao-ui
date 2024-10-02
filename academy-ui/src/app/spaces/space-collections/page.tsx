import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CollectionPageLoading from '@dodao/web-core/src/components/core/loaders/CollectionPageLoading';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Space } from '@prisma/client';
import { getServerSession } from 'next-auth';
import React, { Suspense } from 'react';

async function SpaceCollections() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  let spaces: Space[] = [];

  if (session) {
    const response = await fetch(`${getBaseUrl()}/api/${space.id}/queries/users/${session.username}/spaces`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    spaces = await response.json();
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
