import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import React from 'react';

async function TidbitCollection(props: { space: SpaceWithIntegrationsFragment; params: { categoryId?: any } }) {
  const { space } = props;

  const categoryWithByteCollection = await getApiResponse<CategoryWithByteCollection>(space, `byte-collection-categories/${props.params.categoryId}`);

  return (
    <PageWrapper>
      <h1 className="mb-8 text-3xl">{categoryWithByteCollection.name}</h1>
      <p className="mb-8 text-xl">{categoryWithByteCollection.excerpt}</p>
      {categoryWithByteCollection && (
        <ByteCollectionsGrid
          byteCollections={categoryWithByteCollection.byteCollections as ByteCollectionFragment[]}
          space={space}
          byteCollectionType={'byteCollection'}
          byteCollectionsPageUrl={`/tidbit-collections`}
        />
      )}
    </PageWrapper>
  );
}

export default TidbitCollection;
