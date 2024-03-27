import ViewByteCollectionCategory from '@/components/byteCollectionCategory/ViewByteCollectionCategory';
import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@/components/core/page/PageWrapper';
import { CategoryWithByteCollection } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

async function TidbitCollection(props: { params: { categoryId?: string } }) {
  const space = (await getSpaceServerSide())!;

  const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${props.params.categoryId}`);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: categoryWithByteCollection.name,
      href: `/tidbit-collection-categories/view/${props.params.categoryId}/tidbit-collections`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} />
      <ViewByteCollectionCategory space={space} categoryWithByteCollection={categoryWithByteCollection} />{' '}
    </PageWrapper>
  );
}

export default TidbitCollection;
