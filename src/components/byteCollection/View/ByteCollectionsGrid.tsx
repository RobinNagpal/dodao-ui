'use client';

import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import CardLoader, { CardLoaderType } from '@/components/core/loaders/CardLoader';
import {
  ByteCollectionFragment,
  ByteDetailsFragment,
  ProjectByteCollectionFragment,
  ProjectByteFragment,
  ProjectFragment,
  SpaceWithIntegrationsFragment,
  useProjectByteQuery,
  useQueryByteDetailsQuery,
} from '@/graphql/generated/generated-types';
import React from 'react';

export default function ByteCollectionsGrid({
  byteCollections,
  loadingData,
  space,
  project,

  byteCollectionType,
}: {
  loadingData: boolean;
  byteCollections?: ByteCollectionFragment[] | ProjectByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
}) {
  const [selectedByteId, setSelectedByteId] = React.useState<string | null>(null);

  const onSelectByte = (byteId: string) => {
    setSelectedByteId(byteId);
  };

  const { refetch: fetchProjectByte } = useProjectByteQuery({
    skip: true,
  });

  const { refetch: fetchSpaceByte } = useQueryByteDetailsQuery({ skip: true });

  const fetchByteFn = async (byteId: string): Promise<ByteDetailsFragment | ProjectByteFragment> => {
    if (byteCollectionType === 'projectByteCollection') {
      const response = await fetchProjectByte({
        projectId: project!.id,
        id: byteId,
      });
      return response.data.projectByte;
    }

    const response = await fetchSpaceByte({
      byteId: byteId,
      spaceId: space.id,
    });

    return response.data.byte;
  };

  return (
    <>
      {!byteCollections?.length && !loadingData && <NoByteCollections spaceOrProjectName={project?.name || space.name} />}
      {!!byteCollections?.length && (
        <Grid2Cols>
          {byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard
              key={i}
              byteCollection={byteCollection}
              onSelectByte={onSelectByte}
              project={project}
              byteCollectionType={byteCollectionType}
            />
          ))}
        </Grid2Cols>
      )}
      <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      {loadingData && (
        <Grid2Cols>
          <CardLoader numberOfCards={2} type={CardLoaderType.CardWithSections} />
        </Grid2Cols>
      )}

      {selectedByteId && (
        <ViewByteModal
          showByteModal={!!selectedByteId}
          onClose={() => setSelectedByteId(null)}
          space={space}
          byteId={selectedByteId}
          fetchByteFn={fetchByteFn}
        />
      )}
    </>
  );
}
