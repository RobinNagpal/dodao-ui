'use client';

import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  project,
  byteCollectionType,
  byteCollectionsBaseUrl,
}: {
  byteCollections?: ByteCollectionFragment[] | ProjectByteCollectionFragment[];
  space: SpaceWithIntegrationsFragment;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  byteCollectionsBaseUrl: string;
}) {
  const router = useRouter();

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
              byteCollectionId={byteCollection.id}
              space={space}
            />
          ))}
          <div className="flex-1 flex flex-col justify-center">
            <button
              className="bg-none border-dotted border-4 h-40 w-full text-gray-400 rounded-lg hover:bg-gray-200 transition"
              style={{ margin: '0 auto' }}
              onClick={() => router.push('/tidbit-collections/edit')}
            >
              + Add New Tidbit Collection
            </button>
          </div>
        </Grid2Cols>
      )}
    </>
  );
}
