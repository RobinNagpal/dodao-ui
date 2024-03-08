import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  project,
  byteCollectionType,

  selectedByteCollectionId,
  selectedByteId,
  onViewByteModalClosed,
}: {
  byteCollections?: ByteCollectionFragment[] | ProjectByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  selectedByteCollectionId?: string;
  selectedByteId?: string;
  onViewByteModalClosed: () => void;
}) {
  return (
    <>
      {!byteCollections?.length && <NoByteCollections spaceOrProjectName={project?.name || space.name} />}
      {!!byteCollections?.length && (
        <Grid2Cols>
          {byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard key={i} byteCollection={byteCollection} project={project} byteCollectionType={byteCollectionType} space={space} />
          ))}
        </Grid2Cols>
      )}
      {selectedByteCollectionId && selectedByteId && (
        <ViewByteModal
          space={space}
          project={project}
          byteCollectionType={byteCollectionType}
          selectedByteCollectionId={selectedByteCollectionId}
          selectedByteId={selectedByteId}
          onViewByteModalClosed={onViewByteModalClosed}
        />
      )}
    </>
  );
}
