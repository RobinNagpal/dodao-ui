'use client';

import withSpace from '@/contexts/withSpace';
import RatingsTable from '@/components/app/Rating/Table/RatingsTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, GuideFragment, ConsolidatedGuideRatingQuery, ConsolidatedByteRatingQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { useEffect } from 'react';
import axios from 'axios';

function GuideSubmissionsPage(props: { space: SpaceWithIntegrationsFragment; params: { guideId: string } }) {
  const [guideRatingsResponse, setGuideRatingsResponse] = React.useState<any>();
  const [consolidatedRatingsResponse, setConsolidatedRatingsResponse] = React.useState<ConsolidatedByteRatingQuery | ConsolidatedGuideRatingQuery>();
  const [guideResponse, setGuideResponse] = React.useState<{ guide: GuideFragment }>();
  const [loadingGuideRatings, setLoadingGuideRatings] = React.useState(true);
  useEffect(() => {
    async function fetchGuideRatings() {
      setLoadingGuideRatings(true);
      let response = await axios.get(`/api/guide/${props.params.guideId}`);
      const guideUuid = response.data.guide.uuid;
      setGuideResponse(response.data);
      response = await axios.get('/api/guide/guide-ratings', {
        params: {
          guideUuid: guideUuid,
          spaceId: props.space.id,
        },
      });
      setGuideRatingsResponse(response.data);
      response = await axios.get('/api/guide/consolidated-guide-rating', {
        params: {
          guideUuid: guideUuid,
          spaceId: props.space.id,
        },
      });
      setConsolidatedRatingsResponse(response.data);
      setLoadingGuideRatings(false);
    }
    fetchGuideRatings();
  }, [props.params.guideId]);

  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/guides/view/${props.params.guideId}/0`} className="text-color">
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

export default withSpace(GuideSubmissionsPage);
