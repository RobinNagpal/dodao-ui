import ByteRatingsTable from '@/components/bytes/Rating/ByteRatingsTable';
import PageWrapper from '@/components/core/page/PageWrapper';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import Link from 'next/link';
import React from 'react';

export default async function ByteRatingPage(props: { params: { byteId: string } }) {
  const space = await getSpaceServerSide();
  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/tidbits/view/${props.params.byteId}/0`} className="text-color">
          <span className="mr-1 font-bold">&#8592;</span>
          Back to Tidbit
        </Link>
      </div>
      <div className="mt-4">
        <ByteRatingsTable space={space!} byteId={props.params.byteId} />
      </div>
    </PageWrapper>
  );
}
