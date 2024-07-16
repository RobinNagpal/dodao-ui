import RatingsTable from '@/components/app/Rating/Table/RatingsTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import {
  SpaceWithIntegrationsFragment,
  useByteRatingsQuery,
  useConsolidatedByteRatingQuery,
  useQueryByteDetailsQuery,
} from '@/graphql/generated/generated-types';
import React from 'react';

export default function ByteRatingView(props: { space: SpaceWithIntegrationsFragment; byteId: string }) {
  const { data: byteRatingsResponse, loading: loadingByteRatings } = useByteRatingsQuery({
    variables: {
      spaceId: props.space.id,
      byteId: props.byteId,
    },
  });

  const { data: consolidatedRatingsResponse, loading: loadingConsolidatedRatings } = useConsolidatedByteRatingQuery({
    variables: {
      spaceId: props.space.id,
      byteId: props.byteId,
    },
  });

  const { data: byteResponse } = useQueryByteDetailsQuery({
    variables: {
      spaceId: props.space.id,
      byteId: props.byteId,
    },
  });
  return (
    <PageWrapper>
      <div style={{ color: 'var(--heading-color)' }} className="mt-4">
        <RatingsTable
          ratingType="Byte"
          space={props.space!}
          ratingsResponse={byteRatingsResponse!}
          consolidatedRatingsResponse={consolidatedRatingsResponse!}
          name={byteResponse?.byte?.name!}
          content={byteResponse?.byte?.content!}
          loadingRatings={loadingByteRatings}
        />
      </div>
    </PageWrapper>
  );
}
