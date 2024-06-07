import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ByteCollectionFragment, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

interface ViewByteCollectionCategoryProps {
  space: SpaceWithIntegrationsFragment;
  categoryWithByteCollection: CategoryWithByteCollection;
}

export default function ViewByteCollectionCategory(props: ViewByteCollectionCategoryProps) {
  const { space, categoryWithByteCollection } = props;

  return (
    <div>
      <h1 className="pt-4 md:pt-6 text-2xl lg:text-3xl ">{categoryWithByteCollection.name}</h1>
      <p className="pt-4 md:pt-6 text-lg lg:text-xl">{categoryWithByteCollection.excerpt}</p>
      <div className="pt-4 md:pt-6">
        {categoryWithByteCollection && (
          <ByteCollectionsGrid
            byteCollections={categoryWithByteCollection.byteCollections as ByteCollectionFragment[]}
            space={space}
            byteCollectionType={'byteCollection'}
            byteCollectionsBaseUrl={`/tidbit-collection-categories/view/${categoryWithByteCollection.id}/tidbit-collections`}
          />
        )}
      </div>
    </div>
  );
}
