import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCollectionCategory/ByteCollectionCategoryCardAdminDropdown';
import NoByteCollectionCategories from '@/components/byteCollectionCategory/NoByteCollectionCategory';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ByteCollectionCategory, ByteCollectionFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import Link from 'next/link';
import React from 'react';

async function TidbitCollectionCategories() {
  const space = (await getSpaceServerSide())!;
  const byteCollectionCategories = await getApiResponse<ByteCollectionCategory[]>(space, `byte-collection-categories`);

  if (byteCollectionCategories.length === 0) {
    return (
      <PageWrapper>
        <NoByteCollectionCategories space={space} />
      </PageWrapper>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] mt-4 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {byteCollectionCategories.map((category) => (
          <div key={category.id} style={{ minWidth: '300px' }} className="shadow-lg rounded-lg p-4 flex flex-col items-start">
            <div className="w-full flex justify-end">
              <ByteCollectionCategoryCardAdminDropdown categoryId={category.id} />
            </div>
            <div className="flex items-center justify-center w-12 h-12">{category.imageUrl && <img src={category.imageUrl} alt="category image" />}</div>
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.excerpt}</p>
            <Link
              href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections/`}
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

export default TidbitCollectionCategories;
