import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails({ params }: { params: Promise<{ tidbitCollectionId: string; tidbitId?: string }> }) {
  const space = (await getSpaceServerSide())!;

  const { tidbitCollectionId, tidbitId } = await params;
  return (
    <ViewByteModal
      space={space}
      byteCollectionId={tidbitCollectionId}
      selectedByteId={tidbitId!}
      viewByteModalClosedUrl={space.type === SpaceTypes.TidbitsSite ? '/' : '/tidbit-collections'}
      afterUpsertByteModalClosedUrl={space.type === SpaceTypes.TidbitsSite ? '/' : `/tidbit-collections/view/${tidbitCollectionId}`}
    />
  );
}
