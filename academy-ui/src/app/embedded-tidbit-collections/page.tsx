import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
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
  const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;
  return (
    <PageWrapper>
      <ByteCollectionsGrid byteCollections={byteCollections} space={space!} byteCollectionsBaseUrl={`/embedded-tidbit-collections`} />
    </PageWrapper>
  );
}
