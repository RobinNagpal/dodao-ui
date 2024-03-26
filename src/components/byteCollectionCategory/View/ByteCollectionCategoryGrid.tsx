'use client';
import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import ByteCollectionCategoryCard from '../ByteCollectionCategoryCard';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { Session } from '@/types/auth/Session';
import { isSuperAdmin } from '@/utils/auth/superAdmins';

interface ByteCollectionCategoryGrid {
  space: SpaceWithIntegrationsFragment;
  categoriesArray: CategoryWithByteCollection[];
}

export default function ByteCollectionCategoryGrid({ space, categoriesArray }: ByteCollectionCategoryGrid) {
  const { data: session } = useSession();
  const isUserAdmin = session && (isAdmin(session as Session, space) || isSuperAdmin(session as Session));
  return (
    <Grid3Cols>
      {categoriesArray.map((category) => (
        <ByteCollectionCategoryCard space={space} category={category} key={category.id} isUserAdmin={isUserAdmin as boolean} />
      ))}
    </Grid3Cols>
  );
}
