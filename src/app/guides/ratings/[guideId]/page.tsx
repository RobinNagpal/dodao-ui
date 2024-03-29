'use client';

import withSpace from '@/app/withSpace';
import RatingsTable from '@/components/app/Rating/Table/RatingsTable';
import PageWrapper from '@/components/core/page/PageWrapper';
import { SpaceWithIntegrationsFragment, useConsolidatedGuideRatingQuery, useGuideQueryQuery, useGuideRatingsQuery } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React from 'react';

function GuideSubmissionsPage(props: { space: SpaceWithIntegrationsFragment; params: { guideId: string } }) {
  const { data: guideRatingsResponse, loading: loadingGuideRatings } = useGuideRatingsQuery({
    variables: {
      spaceId: props.space.id,
      guideUuid: props.params.guideId,
    },
  });

  const { data: consolidatedRatingsResponse, loading: loadingConsolidatedRatings } = useConsolidatedGuideRatingQuery({
    variables: {
      spaceId: props.space.id,
      guideUuid: props.params.guideId,
    },
  });

  const { data: guideResponse } = useGuideQueryQuery({
    variables: {
      spaceId: props.space.id,
      uuid: props.params.guideId,
    },
  });

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
          ratingsResponse={guideRatingsResponse!}
          consolidatedRatingsResponse={consolidatedRatingsResponse!}
          loadingRatings={loadingGuideRatings}
          name={guideResponse?.guide?.name!}
          content={guideResponse?.guide?.content!}
        />
      </div>
    </PageWrapper>
  );
}

export default withSpace(GuideSubmissionsPage);
