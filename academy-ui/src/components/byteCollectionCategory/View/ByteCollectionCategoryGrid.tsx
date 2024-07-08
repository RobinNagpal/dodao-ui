import { Grid3Cols } from '@dodao/web-core/components/core/grids/Grid3Cols';
import ByteCollectionCategoryCard from '../ByteCollectionCategoryCard';
import { CategoryWithByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { isAdmin } from '@/utils/auth/isAdmin';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
interface ByteCollectionCategoryGridProps {
  space: SpaceWithIntegrationsFragment;
  categoriesArray: CategoryWithByteCollection[];
  session: Session;
}

export default function ByteCollectionCategoryGrid({ space, categoriesArray, session }: ByteCollectionCategoryGridProps) {
  const isUserAdmin = session && (isAdmin(session as Session, space) || isSuperAdmin(session as Session));
  const notArchivedCategoriesArray = categoriesArray.filter((category) => category.archive !== true);

  return (
    <Grid3Cols>
      {notArchivedCategoriesArray.map((category) => (
        <ByteCollectionCategoryCard space={space} category={category} key={category.id} isUserAdmin={!!isUserAdmin} />
      ))}
    </Grid3Cols>
  );
}
