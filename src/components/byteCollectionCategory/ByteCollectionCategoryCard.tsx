import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCollectionCategory/ByteCollectionCategoryCardAdminDropdown';
import { ByteCollectionCategory, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';

interface ByteCollectionCategoryCardProps {
  space: SpaceWithIntegrationsFragment;
  category: CategoryWithByteCollection | ByteCollectionCategory;
}

export default function ByteCollectionCategoryCard(props: ByteCollectionCategoryCardProps) {
  const { category } = props;
  return (
    <div key={category.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-start">
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
  );
}
