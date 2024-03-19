import ViewByteCollectionCategory from '@/components/byteCollectionCategory/ViewByteCollectionCategory';
import PageWrapper from '@/components/core/page/PageWrapper';
import { CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollection(props: { params: { categoryId?: string } }) {
  const space = (await getSpaceServerSide())!;

  const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${props.params.categoryId}`);

  return (
    <PageWrapper>
      <ViewByteCollectionCategory space={space} categoryWithByteCollection={categoryWithByteCollection} />{' '}
    </PageWrapper>
  );
}

export default TidbitCollection;
