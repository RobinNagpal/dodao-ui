import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';
import SpaceCollections from '@/components/spaces/SpaceCollections/SpaceCollections';

async function SpaceCollectionsPage() {
  const space = (await getSpaceServerSide())!;

  return <SpaceCollections space={space} />;
}

export default SpaceCollectionsPage;
