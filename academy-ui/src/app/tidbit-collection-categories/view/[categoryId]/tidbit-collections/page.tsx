import ViewByteCollectionCategory from '@/components/byteCollectionCategory/ViewByteCollectionCategory';
import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';
import axios from 'axios';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

async function TidbitCollection(props: { params: { categoryId?: string } }) {
  const space = (await getSpaceServerSide())!;

  const response = await axios.get(`${getBaseUrl()}/api/byte-collection-categories/${props.params.categoryId}?spaceId=${space.id}`);
  const categoryWithByteCollection = response.data.byteCollectionCategoryWithByteCollections;

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
