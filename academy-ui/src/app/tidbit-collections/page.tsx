import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import fetchDataServerSide from '@/utils/api/fetchDataServerSide';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CollectionPageLoading from '@dodao/web-core/components/core/loaders/CollectionPageLoading';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getServerSession } from 'next-auth';
import React, { Suspense } from 'react';

async function TidbitCollections() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  const byteCollections = await fetchDataServerSide<ByteCollectionSummary[]>(`${getBaseUrl()}/api/${space.id}/byte-collections`);

  let filteredCollections;

  if (session?.isAdminOfSpace) {
    filteredCollections = byteCollections.filter(
      (collection) => !(collection.id === `UNGROUPED-TIDBITS-${space.id}` && Array.isArray(collection.bytes) && collection.bytes.length === 0)
    );
  } else {
    filteredCollections = byteCollections.filter((collection) => collection.id !== `UNGROUPED-TIDBITS-${space.id}`);
  }

  return (
    <PageWrapper>
      <Suspense fallback={<CollectionPageLoading />}>
        <ByteCollectionsGrid
          byteCollections={filteredCollections}
          space={space}
          byteCollectionsBaseUrl={`/tidbit-collections`}
          isAdmin={session?.isAdminOfSpace}
        />
      </Suspense>
    </PageWrapper>
  );
}

export default TidbitCollections;
