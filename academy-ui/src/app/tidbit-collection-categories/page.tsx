import NoByteCollectionCategories from '@/components/byteCollectionCategory/NoByteCollectionCategory';
import ByteCollectionCategoryGrid from '@/components/byteCollectionCategory/View/ByteCollectionCategoryGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@dodao/web-core/api/auth/getSpaceServerSide';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth';
import { Session } from '@dodao/web-core/types/auth/Session';
import React from 'react';

async function TidbitCollectionCategories() {
  const space = (await getSpaceServerSide())!;
  const session = (await getServerSession(authOptions)) as Session | null;
  const byteCollectionCategories = await getApiResponse<CategoryWithByteCollection[]>(space, `byte-collection-categories`);

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
