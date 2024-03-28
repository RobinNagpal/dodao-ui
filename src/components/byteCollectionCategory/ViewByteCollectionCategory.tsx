import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

interface ViewByteCollectionCategoryProps {
  space: SpaceWithIntegrationsFragment;
  categoryWithByteCollection: CategoryWithByteCollection;
}

export default function ViewByteCollectionCategory(props: ViewByteCollectionCategoryProps) {
  const { space, categoryWithByteCollection } = props;

  return (
    <PageWrapper>
      <h1 className="mb-8 text-3xl">{categoryWithByteCollection.name}</h1>
      <p className="mb-8 text-xl">{categoryWithByteCollection.excerpt}</p>
      {categoryWithByteCollection && (
        <ByteCollectionsGrid
          byteCollections={categoryWithByteCollection.byteCollections as ByteCollectionFragment[]}
          space={space}
          byteCollectionType={'byteCollection'}
          byteCollectionsPageUrl={`/tidbit-collection-categories/view/${categoryWithByteCollection.id}/tidbit-collections`}
        />
      )}
    </PageWrapper>
  );
}
