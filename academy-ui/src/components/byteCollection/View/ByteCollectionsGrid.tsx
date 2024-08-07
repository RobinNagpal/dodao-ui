import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import { ByteCollectionFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import React from 'react';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  byteCollectionsBaseUrl,
  isAdmin,
}: {
  byteCollections?: ByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  byteCollectionsBaseUrl: string;
  isAdmin?: boolean | undefined;
}) {
  return (
    <>
      {!byteCollections?.length && <NoByteCollections space={space} isAdmin={isAdmin} />}
      {!!byteCollections?.length && (
        <Grid2Cols>
          {byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard
              key={i}
              byteCollection={byteCollection}
              viewByteBaseUrl={`${byteCollectionsBaseUrl}/view/${byteCollection.id}/`}
              space={space}
              isAdmin={isAdmin}
            />
          ))}

          {isAdmin! && <AddByteCollection space={space} />}
        </Grid2Cols>
      )}
    </>
  );
}
