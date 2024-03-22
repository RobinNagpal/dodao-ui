import ByteCollectionCategoryCard from '@/components/byteCollectionCategory/ByteCollectionCategoryCard';
import NoByteCollectionCategories from '@/components/byteCollectionCategory/NoByteCollectionCategory';
import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import PageWrapper from '@/components/core/page/PageWrapper';
import { TidbitSiteTabIds } from '@/components/home/TidbitsSite/TidbitSiteTabIds';
import TidbitsSiteTabs from '@/components/home/TidbitsSite/TidbitsSiteTabs';
import { ByteCollectionCategory } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollectionCategories() {
  const space = (await getSpaceServerSide())!;
  const byteCollectionCategories = await getApiResponse<ByteCollectionCategory[]>(space, `byte-collection-categories`);

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

      <Grid3Cols>
        {byteCollectionCategories.map((category) => (
          <ByteCollectionCategoryCard space={space} category={category} key={category.id} />
        ))}
      </Grid3Cols>
    </PageWrapper>
  );
}

export default TidbitCollectionCategories;
