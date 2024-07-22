'use client';

import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';

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
  async function upsertByteCollectionFn(byteCollection: EditByteCollection, byteCollectionId: string | null) {
    await fetch('/api/byte-collection/create-byte-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          spaceId: space.id,
          name: byteCollection.name,
          description: byteCollection.description,
          byteIds: [],
          status: byteCollection.status,
          priority: byteCollection.priority,
          videoUrl: byteCollection.videoUrl,
        },
      }),
    });
  }
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);

  function onClose() {
    setShowAddCollectionModal(false);
  }

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
            />
          ))}
          <div className="w-full flex items-center justify-center">
            <button
              className="h-40 w-full border-2 border-gray-300 border-dotted tracking-wider rounded-lg bg-white hover:bg-gray-100 hover:border-gray-300 text-gray-600 "
              onClick={() => setShowAddCollectionModal(true)}
            >
              + Add Tidbit Collection
            </button>
          </div>
        </Grid2Cols>
      )}

      {showAddCollectionModal ? (
        <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit Collection'}>
          <div className="text-left">
            <PageWrapper>
              <SingleCardLayout>
                <ByteCollectionEditor
                  space={space}
                  byteCollection={undefined}
                  viewByteCollectionsUrl={'/tidbit-collections'}
                  upsertByteCollectionFn={upsertByteCollectionFn}
                />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      ) : (
        <PageLoading />
      )}
    </>
  );
}
