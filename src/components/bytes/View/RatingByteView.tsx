import ByteRatingsTable from '@/components/bytes/Rating/ByteRatingsTable';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';

export default function ByteRatingView(props: { space: SpaceWithIntegrationsFragment; byteId: string }) {
  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/tidbits/view/${props.byteId}/0`} className="text-color">
          <span className="mr-1 font-bold">&#8592;</span>
          Back to Tidbit
        </Link>
      </div>
      <div className="mt-4">
        <ByteRatingsTable space={props.space!} byteId={props.byteId} />
      </div>
    </PageWrapper>
  );
}
