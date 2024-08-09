import NoByteCollectionCategories from '@/components/byteCollectionCategory/NoByteCollectionCategory';
import ByteCollectionCategoryGrid from '@/components/byteCollectionCategory/View/ByteCollectionCategoryGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getServerSession } from 'next-auth';
import { Session } from '@dodao/web-core/types/auth/Session';
import React from 'react';
import axios from 'axios';

async function TidbitCollectionCategories() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  const response = await axios.get(`${getBaseUrl()}/api/byte-collection-categories?spaceId=${space.id}`);
  const byteCollectionCategories = response.data.byteCollectionCategories;

  if (byteCollectionCategories.length === 0) {
    return (
      <PageWrapper>
        <NoByteCollectionCategories space={space} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TidbitsSiteTabs selectedTabId={TidbitSiteTabIds.TidbitCollectionCategories} />
      <ByteCollectionCategoryGrid space={space} categoriesArray={byteCollectionCategories} session={session!} />
    </PageWrapper>
  );
}

export default TidbitCollectionCategories;
