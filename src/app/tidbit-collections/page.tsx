import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollections() {
  const space = (await getSpaceServerSide())!;
  const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');
  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.TidbitCollections} />
      <ByteCollectionsGrid
        byteCollections={byteCollections}
        space={space}
        byteCollectionType={'byteCollection'}
        byteCollectionsPageUrl={`/tidbit-collections`}
      />
    </PageWrapper>
  );
}

export default TidbitCollections;
