import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import { Space } from '@prisma/client';
import NoSpaceCollections from './NoSpaceCollections';

interface SpaceCollectionsClientProps {
  spacesByCreator: Space[];
  spacesByAdmin: Space[];
}

export default function SpaceCollections({ spacesByCreator, spacesByAdmin }: SpaceCollectionsClientProps) {
  return (
    <>
      {spacesByCreator.length === 0 && spacesByAdmin.length === 0 ? (
        <NoSpaceCollections />
      ) : (
        <SpaceCollectionsGrid spacesByCreator={spacesByCreator} spacesByAdmin={spacesByAdmin} />
      )}
    </>
  );
}
