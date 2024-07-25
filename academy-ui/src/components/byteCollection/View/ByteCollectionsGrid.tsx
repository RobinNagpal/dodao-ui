import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import React from 'react';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  project,
  byteCollectionType,
  byteCollectionsBaseUrl,
  isAdmin,
}: {
  byteCollections?: ByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  byteCollectionsBaseUrl: string;
  isAdmin?: boolean | undefined;
}) {
  return (
    <>
      {!byteCollections?.length && <NoByteCollections spaceOrProjectName={project?.name || space.name} />}
      {!!byteCollections?.length && (
        <Grid2Cols>
          {byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard
              key={i}
              byteCollection={byteCollection}
              project={project}
              byteCollectionType={byteCollectionType}
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
