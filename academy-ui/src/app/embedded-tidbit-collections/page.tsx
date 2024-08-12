import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import React from 'react';

export default async function EmbeddedTidbitsPage() {
  const space = await getSpaceServerSide();
  const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
    params: {
      spaceId: space!.id,
    },
  });
  const byteCollections: ByteCollectionSummary[] = response.data.byteCollections;
  return (
    <PageWrapper>
      <ByteCollectionsGrid byteCollections={byteCollections} space={space!} byteCollectionsBaseUrl={`/embedded-tidbit-collections`} />
    </PageWrapper>
  );
}
