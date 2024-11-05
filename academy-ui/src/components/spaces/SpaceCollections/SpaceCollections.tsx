import SpaceCollectionsGrid from '@/components/spaces/SpaceCollections/View/SpaceCollectionsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Space } from '@prisma/client';
import NoSpaceCollections from './NoSpaceCollections';

interface SpaceCollectionsClientProps {
  spacesByCreator: Space[];
}

export default function SpaceCollections({ spacesByCreator }: SpaceCollectionsClientProps) {
  return <PageWrapper>{spacesByCreator.length === 0 ? <NoSpaceCollections /> : <SpaceCollectionsGrid spaceCollections={spacesByCreator} />}</PageWrapper>;
}
