import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
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
            byteCollections={categoryWithByteCollection.byteCollections as unknown as ByteCollectionSummary[]}
            space={space}
            byteCollectionsBaseUrl={`/tidbit-collection-categories/view/${categoryWithByteCollection.id}/tidbit-collections`}
          />
        )}
      </div>
    </div>
  );
}
