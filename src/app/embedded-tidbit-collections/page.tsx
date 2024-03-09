import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function EmbeddedTidbitsPage() {
  const space = await getSpaceServerSide();
  const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space!, 'byte-collections');
  return (
    <PageWrapper>
      <ByteCollectionsGrid
        byteCollections={byteCollections}
        space={space!}
        byteCollectionType={'byteCollection'}
        byteCollectionsPageUrl={`/embedded-tidbit-collections`}
      />
    </PageWrapper>
  );
}
