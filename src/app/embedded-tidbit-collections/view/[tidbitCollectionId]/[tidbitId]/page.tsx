import ViewByteModal from '@/components/byteCollection/View/ViewByteModal';
import PageWrapper from '@/components/core/page/PageWrapper';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

export default async function ByteDetails(props: { params: { tidbitCollectionId?: string; tidbitId?: string } }) {
  const space = (await getSpaceServerSide())!;

  return (
    <PageWrapper>
      <ViewByteModal
        space={space}
        byteCollectionType={'byteCollection'}
        selectedByteId={props.params.tidbitId!}
        viewByteModalClosedUrl={'/embedded-tidbit-collections'}
        afterUpsertByteModalClosedUrl={`/embedded-tidbit-collections/view/${props.params?.tidbitCollectionId}`}
      />
    </PageWrapper>
  );
}
