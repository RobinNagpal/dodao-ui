import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCollectionCategory/ByteCollectionCategoryCardAdminDropdown';
import Card from '@/components/core/card/Card';
import {
  ByteCollectionCategory,
  CategoryWithByteCollection,
  SpaceWithIntegrationsFragment,
  ByteCollectionCategoryStatus,
} from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionCategoryCard.module.scss';

interface ByteCollectionCategoryCardProps {
  space: SpaceWithIntegrationsFragment;
  category: CategoryWithByteCollection | ByteCollectionCategory;
  isUserAdmin: boolean;
}

export default function ByteCollectionCategoryCard(props: ByteCollectionCategoryCardProps) {
  const { category, isUserAdmin } = props;
  if (!isUserAdmin && category.status === ByteCollectionCategoryStatus.Hidden) return null;

  if (!isUserAdmin && category.status === ByteCollectionCategoryStatus.ComingSoon) {
    return (
      <Card>
        <div className="card blog-card w-full">
          <div className="p-6">
            <div className="w-full flex justify-end">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 mx-2 text-xs font-medium text-blue-600">Coming Soon</span>
            </div>
            <div className="flex items-center justify-center w-12 h-12">
              {category.imageUrl && <img style={{ maxWidth: '50px' }} src={category.imageUrl} alt="category image" />}
            </div>
            <h3 className="text-xl font-semibold mt-6">{category.name}</h3>
            <p className="text-md mt-2 mb-4">{category.excerpt}</p>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <Link href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections`} className="card blog-card w-inline-block h-full w-full">
        <div className="p-6">
          <div className="w-full flex justify-end">
            {isUserAdmin && category.status === ByteCollectionCategoryStatus.Hidden && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 mr-2 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Hidden
              </span>
            )}
            {isUserAdmin && category.status === ByteCollectionCategoryStatus.ComingSoon && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 mr-2 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Coming Soon
              </span>
            )}
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
