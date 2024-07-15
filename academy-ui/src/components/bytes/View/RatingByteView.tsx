import RatingsTable from '@/components/app/Rating/Table/RatingsTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import {
  ConsolidatedByteRating,
  ConsolidatedByteRatingQuery,
  SpaceWithIntegrationsFragment,
  ConsolidatedGuideRatingQuery,
  ByteRatingsQuery,
} from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';
import axios from 'axios';
import { Byte } from '@prisma/client';

export default function ByteRatingView(props: { space: SpaceWithIntegrationsFragment; byteId: string }) {
  const [consolidatedRatingsResponse, setConsolidatedRatingsResponse] = React.useState<ConsolidatedByteRatingQuery | ConsolidatedGuideRatingQuery>();
  const [byteResponse, setByteResponse] = React.useState<Byte>();
  const [byteRatingsResponse, setByteRatingsResponse] = React.useState<any>();
  const [loadingByteRatings, setLoadingByteRatings] = React.useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      setLoadingByteRatings(true);
      const response = await axios.get('/api/byte/consolidate-byte-rating', {
        params: {
          byteId: props.byteId,
          spaceId: props.space.id,
        },
      });
      setConsolidatedRatingsResponse(response.data.consolidatedByteRating);

      const byteResponse = await axios.get('/api/byte/byte', {
        params: {
          byteId: props.byteId,
          spaceId: props.space.id,
        },
      });
      setByteResponse(byteResponse.data.byte);

      const byteRatingresponse = await axios.get('/api/byte/byte-ratings', {
        params: {
          byteId: props.byteId,
          spaceId: props.space.id,
        },
      });
      setByteRatingsResponse(byteRatingresponse.data);
      setLoadingByteRatings(false);
    }
    fetchData();
  }, [props.byteId, props.space.id]);

  return (
    <PageWrapper>
      <div className="mt-4">
        <RatingsTable
          ratingType="Byte"
          space={props.space!}
          ratingsResponse={byteRatingsResponse!}
          consolidatedRatingsResponse={consolidatedRatingsResponse!}
          name={byteResponse?.name!}
          content={byteResponse?.content!}
          loadingRatings={loadingByteRatings}
        />
      </div>
    </PageWrapper>
  );
}
