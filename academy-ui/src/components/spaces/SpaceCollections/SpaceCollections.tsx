import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { Space } from '@prisma/client';
import NoSpaceCollections from './NoSpaceCollections';

interface SpaceCollectionsClientProps {
  spacesByCreator: Space[];
  spacesWhereAdmin: Space[];
}

export default function SpaceCollections({ spacesByCreator, spacesWhereAdmin }: SpaceCollectionsClientProps) {
  const uniqueSpacesWhereAdmin = spacesWhereAdmin.filter((adminSpace) => !spacesByCreator.some((creatorSpace) => creatorSpace.id === adminSpace.id));
  return (
    <>
      {spacesByCreator.length === 0 && spacesWhereAdmin.length === 0 ? (
        <NoSpaceCollections />
      ) : (
        <SpaceCollectionsGrid spacesByCreator={spacesByCreator} spacesWhereAdmin={uniqueSpacesWhereAdmin} />
      )}
    </>
  );
}
