import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import fetchDataServerSide from '@dodao/web-core/ui/hooks/useServerFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

export default async function EmbeddedTidbitsPage() {
  const space = await getSpaceServerSide();

  const byteCollections = await fetchDataServerSide<ByteCollectionSummary[]>(`${getBaseUrl()}/api/${space!.id}/byte-collections`);

  return (
    <PageWrapper>
      <ByteCollectionsGrid byteCollections={byteCollections} space={space!} byteCollectionsBaseUrl={`/embedded-tidbit-collections`} />
    </PageWrapper>
  );
}
