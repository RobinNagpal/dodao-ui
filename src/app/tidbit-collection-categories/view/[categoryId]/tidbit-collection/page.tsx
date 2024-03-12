'use client';

import withSpace from '@/app/withSpace';
import React from 'react';
import { ByteCollectionFragment, SpaceWithIntegrationsFragment, useByteCollectionCategoryWithByteCollectionsQuery } from '@/graphql/generated/generated-types';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';

export function tidbitCollection(props: { space: SpaceWithIntegrationsFragment; params: { categoryId?: any } }) {
  const { space } = props;

  const { data } = useByteCollectionCategoryWithByteCollectionsQuery({
    variables: {
      categoryId: props.params.categoryId,
      spaceId: space.id,
    },
  });

  return (
    <PageWrapper>
      {data && (
        <ByteCollectionsGrid
          byteCollections={data.byteCollectionCategoryWithByteCollections as ByteCollectionFragment[]}
          space={space}
          byteCollectionType={'byteCollection'}
          byteCollectionsPageUrl={`/tidbit-collections`}
        />
      )}
    </PageWrapper>
  );
}

export default withSpace(tidbitCollection);
