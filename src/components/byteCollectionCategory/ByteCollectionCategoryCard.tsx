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
import Badge, { BadgeColor, BadgeSize } from '@/components/core/badge/Badge';

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
              <Badge size={BadgeSize.md} color={BadgeColor.base}>
                Coming Soon
              </Badge>
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
        <div id="inside-link" className="p-6">
          <div className="w-full flex justify-end h-8">
            {isUserAdmin && category.status === ByteCollectionCategoryStatus.Hidden && (
              <Badge size={BadgeSize.md} color={BadgeColor.red}>
                Hidden
              </Badge>
            )}
            {isUserAdmin && category.status === ByteCollectionCategoryStatus.ComingSoon && (
              <Badge size={BadgeSize.md} color={BadgeColor.base}>
                Coming Soon
              </Badge>
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
