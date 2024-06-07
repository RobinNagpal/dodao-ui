import { Grid3Cols } from '@/components/core/grids/Grid3Cols';
import ByteCollectionCategoryCard from '../ByteCollectionCategoryCard';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { isAdmin } from '@/utils/auth/isAdmin';
import { Session } from '@/types/auth/Session';
import { isSuperAdmin } from '@/utils/auth/superAdmins';
interface ByteCollectionCategoryGridProps {
  space: SpaceWithIntegrationsFragment;
  categoriesArray: CategoryWithByteCollection[];
  session: Session;
}

export default function ByteCollectionCategoryGrid({ space, categoriesArray, session }: ByteCollectionCategoryGridProps) {
  const isUserAdmin = session && (isAdmin(session as Session, space) || isSuperAdmin(session as Session));
  return (
    <Grid3Cols>
      {categoriesArray.map((category) => (
        <ByteCollectionCategoryCard space={space} category={category} key={category.id} isUserAdmin={!!isUserAdmin} />
      ))}
    </Grid3Cols>
  );
}
