import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import React from 'react';
import { Space } from '@prisma/client';
import SpaceCollectionsCard from '../SpaceCollectionsCard/SpaceCollectionsCard';

interface SpaceCollectionGridProps {
  spaceCollections: Space[];
  space: SpaceWithIntegrationsFragment;
  spaceCollectionsBaseUrl: string;
  isAdmin: boolean | undefined;
}

export default function SpaceCollectionsGrid({ spaceCollections, space, spaceCollectionsBaseUrl, isAdmin }: SpaceCollectionGridProps) {
  return (
    <>
      {!!spaceCollections?.length && (
        <Grid2Cols>
          {spaceCollections.map((byteCollection, i) => (
            <SpaceCollectionsCard
              key={i}
              spaceCollection={byteCollection}
              viewSpaceBaseUrl={`${spaceCollectionsBaseUrl}/view/${byteCollection.id}/`}
              space={space}
              isAdmin={isAdmin}
            />
          ))}
        </Grid2Cols>
      )}
    </>
  );
}
