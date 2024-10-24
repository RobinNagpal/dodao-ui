import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { tidbitCollectionId: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <PageWrapper>
      <ViewByteModal
        byteCollectionId={props.params.tidbitCollectionId}
        space={space}
        selectedByteId={props.params.tidbitId!}
        viewByteModalClosedUrl={'/embedded-tidbit-collections'}
        afterUpsertByteModalClosedUrl={`/embedded-tidbit-collections/view/${props.params?.tidbitCollectionId}`}
      />
    </PageWrapper>
  );
}
