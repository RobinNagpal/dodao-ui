import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCategory/ByteCollectionCategoryCardAdminDropdown';
import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionCategory, ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import Link from 'next/link';
import React from 'react';

async function TidbitCollection() {
  const space = (await getSpaceServerSide())!;
  const byteCollectionCategories = await getApiResponse<ByteCollectionCategory[]>(space, `byte-collection-categories`);

  if (byteCollectionCategories.length === 0) {
    const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');
    return (
      <PageWrapper>
        <ByteCollectionsGrid
          byteCollections={byteCollections}
          space={space}
          byteCollectionType={'byteCollection'}
          byteCollectionsPageUrl={`/tidbit-collections`}
        />
      </PageWrapper>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {byteCollectionCategories.map((category) => (
          <div key={category.id} className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-start">
            <div className="w-full flex justify-end">
              <ByteCollectionCategoryCardAdminDropdown categoryId={category.id} />
            </div>
            <div className="flex items-center justify-center w-12 h-12">{category.imageUrl && <img src={category.imageUrl} alt="category image" />}</div>
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
    </div>
  );
}

export default TidbitCollection;
