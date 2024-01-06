import Block from '@/components/app/Block';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import CardLoader, { CardLoaderType } from '@/components/core/loaders/CardLoader';
import RowLoading from '@/components/core/loaders/RowLoading';
import {
  ByteCollectionFragment,
  ByteDetailsFragment,
  ProjectByteCollectionFragment,
  ProjectByteFragment,
  ProjectFragment,
  SpaceWithIntegrationsFragment,
} from '@/graphql/generated/generated-types';
import React from 'react';

export default function ByteCollectionsGrid({
  byteCollections,
  loadingData,
  space,
  project,
  baseByteCollectionsEditUrl,
  fetchByteFn,
}: {
  loadingData: boolean;
  byteCollections?: ByteCollectionFragment[] | ProjectByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  baseByteCollectionsEditUrl: string;
  fetchByteFn: (byteId: string) => Promise<ByteDetailsFragment | ProjectByteFragment>;
}) {
  const [selectedByteId, setSelectedByteId] = React.useState<string | null>(null);

  const onSelectByte = (byteId: string) => {
    setSelectedByteId(byteId);
  };

  return (
    <>
      {!byteCollections?.length && !loadingData && <NoByteCollections spaceOrProjectName={project?.name || space.name} />}
      {!!byteCollections?.length && (
        <Grid2Cols>
          {byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard key={i} byteCollection={byteCollection} onSelectByte={onSelectByte} baseByteCollectionsEditUrl={baseByteCollectionsEditUrl} />
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
