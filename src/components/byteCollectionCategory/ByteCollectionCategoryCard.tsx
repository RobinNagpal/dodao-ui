import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCollectionCategory/ByteCollectionCategoryCardAdminDropdown';
import Card from '@/components/core/card/Card';
import { ByteCollectionCategory, CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionCategoryCard.module.scss';

interface ByteCollectionCategoryCardProps {
  space: SpaceWithIntegrationsFragment;
  category: CategoryWithByteCollection | ByteCollectionCategory;
}

export default function ByteCollectionCategoryCard(props: ByteCollectionCategoryCardProps) {
  const { category } = props;
  return (
    <Card>
      <Link href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections`} className="card blog-card w-inline-block h-full w-full">
        <div className="p-6">
          <div className="w-full flex justify-end">
            <ByteCollectionCategoryCardAdminDropdown categoryId={category.id} />
          </div>
          <div className="flex items-center justify-center w-12 h-12">
            {category.imageUrl && <img style={{ maxWidth: '50px' }} src={category.imageUrl} alt="category image" />}
          </div>
          <h3 className="text-xl font-semibold mt-6">{category.name}</h3>
          <p className="text-md mt-2 mb-4">{category.excerpt}</p>
          <Link href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections`} className={`fixed bottom-3 ${styles.learnMoreLink}`}>
            Learn more &#x2192;
          </Link>
        </div>
      </Link>
    </Card>
  );
}
