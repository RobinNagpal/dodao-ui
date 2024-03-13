'use client';
import React from 'react';
import { SpaceWithIntegrationsFragment, useByteCollectionCategoriesQuery, useByteCollectionsQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import withSpace from '@/app/withSpace';
import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCategory/ByteCollectionCategoryCardAdminDropdown';

function TidbitCollection(props: { space: SpaceWithIntegrationsFragment }) {
  const { space } = props;
  const { data } = useByteCollectionCategoriesQuery({
    variables: {
      spaceId: space.id,
    },
  });

  const { data: byteCollectionData } = useByteCollectionsQuery({
    variables: {
      spaceId: space.id,
    },
  });

  if (!data || data.byteCollectionCategories.length === 0) {
    return (
      <PageWrapper>
        <ByteCollectionsGrid
          byteCollections={byteCollectionData?.byteCollections}
          space={space}
          byteCollectionType={'byteCollection'}
          byteCollectionsPageUrl={`/tidbit-collections`}
        />
      </PageWrapper>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.byteCollectionCategories.map((category) => (
            <div key={category.id} className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
              <div className="w-full flex justify-end">
                <ByteCollectionCategoryCardAdminDropdown categoryId={category.id} />
              </div>
              <div className="flex items-center justify-center w-12 h-12">
                <img src={category.imageUrl!} alt="category image" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.excerpt}</p>
              <Link
                href={`/tidbit-collection-categories/view/${category.id}/tidbit-collection/`}
                className="mt-auto text-indigo-600 hover:text-indigo-800 transition duration-300"
              >
                See more
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withSpace(TidbitCollection);
