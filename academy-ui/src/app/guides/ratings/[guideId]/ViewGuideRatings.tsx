'use client';

import RatingsTable from '@/components/app/Rating/Table/RatingsTable';
import { ConsolidatedByteRatingQuery, ConsolidatedGuideRatingQuery, GuideFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect } from 'react';

function ViewGuideRatings(props: { space: SpaceWithIntegrationsDto; guideId: string }) {
  const [guideRatingsResponse, setGuideRatingsResponse] = React.useState<any>();
  const [consolidatedRatingsResponse, setConsolidatedRatingsResponse] = React.useState<ConsolidatedByteRatingQuery | ConsolidatedGuideRatingQuery>();
  const [guideResponse, setGuideResponse] = React.useState<{ guide: GuideFragment }>();
  const [loadingGuideRatings, setLoadingGuideRatings] = React.useState(true);
  useEffect(() => {
    async function fetchGuideRatings() {
      setLoadingGuideRatings(true);
      let response = await axios.get(`${getBaseUrl()}/api/guide/${props.guideId}`);
      const guideUuid = response.data.guide.uuid;
      setGuideResponse(response.data);
      response = await axios.get(`${getBaseUrl()}/api/guide/guide-ratings`, {
        params: {
          guideUuid: guideUuid,
          spaceId: props.space.id,
        },
      });
      setGuideRatingsResponse(response.data);
      response = await axios.get(`${getBaseUrl()}/api/guide/consolidated-guide-rating`, {
        params: {
          guideUuid: guideUuid,
          spaceId: props.space.id,
        },
      });
      setConsolidatedRatingsResponse(response.data);
      setLoadingGuideRatings(false);
    }
    fetchGuideRatings();
  }, [props.guideId]);

  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/guides/view/${props.guideId}/0`} className="text-color">
          <span className="mr-1 font-bold">&#8592;</span>
          Back to Guide
        </Link>
      </div>
      <div className="mt-4">
        <RatingsTable
          ratingType="Guide"
          space={props.space}
          ratingsResponse={guideRatingsResponse}
          consolidatedRatingsResponse={consolidatedRatingsResponse!}
          loadingRatings={loadingGuideRatings}
          name={guideResponse?.guide?.guideName!}
          content={guideResponse?.guide?.content!}
        />
      </div>
    </PageWrapper>
  );
}

export default ViewGuideRatings;
