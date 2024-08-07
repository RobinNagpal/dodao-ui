import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { Suspense } from 'react';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
import CollectionPageLoading from '@dodao/web-core/src/components/core/loaders/CollectionPageLoading';

async function TidbitCollections() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;

  const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
    params: {
      spaceId: space.id,
    },
  });
  const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;
  let filteredCollections;

  if (session?.isAdminOfSpace) {
    filteredCollections = byteCollections.filter(
      (collection) => !(collection.id === `UNGROUPED-TIDBITS-${space.id}` && Array.isArray(collection.bytes) && collection.bytes.length === 0)
    );
  } else {
    filteredCollections = byteCollections.filter((collection) => collection.id !== `UNGROUPED-TIDBITS-${space.id}`);
  }

  return (
    <Suspense fallback={<CollectionPageLoading />}>
      <PageWrapper>
        <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.TidbitCollections} />
        <ByteCollectionsGrid
          byteCollections={filteredCollections}
          space={space}
          byteCollectionsBaseUrl={`/tidbit-collections`}
          isAdmin={session?.isAdminOfSpace}
        />
      </PageWrapper>
    </Suspense>
  );
}

export default TidbitCollections;
