import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails({ params }: { params: Promise<{ tidbitCollectionId: string; tidbitId?: string }> }) {
  const space = (await getSpaceServerSide())!;

  const { tidbitCollectionId, tidbitId } = await params;
  return (
    <PageWrapper>
      <ViewByteModal
        byteCollectionId={tidbitCollectionId}
        space={space}
        selectedByteId={tidbitId!}
        viewByteModalClosedUrl={'/embedded-tidbit-collections'}
        afterUpsertByteModalClosedUrl={`/embedded-tidbit-collections/view/${tidbitCollectionId}`}
      />
    </PageWrapper>
  );
}
