import NoByteCollectionCategories from '@/components/byteCollectionCategory/NoByteCollectionCategory';
import ByteCollectionCategoryGrid from '@/components/byteCollectionCategory/View/ByteCollectionCategoryGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollectionCategories() {
  const space = (await getSpaceServerSide())!;
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
      <ByteCollectionCategoryGrid space={space} categoriesArray={byteCollectionCategories} />
    </PageWrapper>
  );
}

export default TidbitCollectionCategories;
