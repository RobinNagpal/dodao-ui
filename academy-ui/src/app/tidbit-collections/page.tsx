import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';
import axios from 'axios';
import getBaseUrl from '@/utils/api/getBaseURL';

async function TidbitCollections() {
  const space = (await getSpaceServerSide())!;
  const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
    params: {
      spaceId: space.id,
    },
  });
  const byteCollections: ByteCollectionFragment[] = response.data.byteCollections;
  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.TidbitCollections} />
      <ByteCollectionsGrid
        byteCollections={byteCollections}
        space={space}
        byteCollectionType={'byteCollection'}
        byteCollectionsBaseUrl={`/tidbit-collections`}
      />
    </PageWrapper>
  );
}

export default TidbitCollections;
