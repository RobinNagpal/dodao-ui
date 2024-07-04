import ByteCollectionCategoryCardAdminDropdown from '@/components/byteCollectionCategory/ByteCollectionCategoryCardAdminDropdown';
import Card from '@dodao/web-core/components/core/card/Card';
import {
  ByteCollectionCategory,
  CategoryWithByteCollection,
  SpaceWithIntegrationsFragment,
  ByteCollectionCategoryStatus,
} from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionCategoryCard.module.scss';
import Badge, { BadgeColor, BadgeSize } from '@dodao/web-core/components/core/badge/Badge';

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
      <div className="card blog-card w-full h-full">
        <Link href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections`} className="block p-6">
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
            {category.status === ByteCollectionCategoryStatus.TryItOut && (
              <Badge size={BadgeSize.md} color={BadgeColor.base} blink>
                Try It Out
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center w-12 h-12">
            {category.imageUrl && <img style={{ maxWidth: '50px' }} src={category.imageUrl} alt="category image" />}
          </div>
          <h3 className="text-xl font-semibold mt-6">{category.name}</h3>
          <p className="text-md mt-2 mb-4">{category.excerpt}</p>
        </Link>
        <div className="absolute top-2 right-2">
          <ByteCollectionCategoryCardAdminDropdown categoryId={category.id} />
        </div>
        <Link href={`/tidbit-collection-categories/view/${category.id}/tidbit-collections`} className={`fixed bottom-3 pl-6 ${styles.learnMoreLink}`}>
          Learn more &#x2192;
        </Link>
      </div>
    </Card>
  );
}
