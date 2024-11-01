'use client';

import styles from '@/components/app/Rating/Table/RatingsTable.module.scss';
import { ConsolidatedGuideRating, RatingDistribution, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ConsolidatedGuideRatingDto } from '@/types/bytes/ConsolidatedGuideRatingDto';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function ConsolidatedRatings(props: { consolidatedRatings: ConsolidatedGuideRating; ratingDistributions: any }) {
  const { consolidatedRatings } = props;
  return (
    <Grid2Cols className="my-12">
      <div className="text-center w-full">
        <h2 className="text-xl font-bold text-center w-full">{`Average Guide Ratings`}</h2>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7">{consolidatedRatings.endRatingFeedbackCount} Ratings Submitted</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">
                  {consolidatedRatings.avgRating ? `${consolidatedRatings.avgRating} / 5` : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className={`text-center w-full flex flex-col justify-center items-center ${styles.reChartsWrapper}`}>
        <h2 className="text-xl font-bold w-full">What did you like the most?</h2>
        {props.ratingDistributions && (
          <PieChart width={350} height={350}>
            <Pie dataKey="value" isAnimationActive={false} data={props.ratingDistributions} cx={150} cy={150} outerRadius={120} fill="#8884d8" label>
              {props.ratingDistributions.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </div>
    </Grid2Cols>
  );
}

export default function ConsolidatedGuideRatings(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: consolidatedRatings } = useFetchData<ConsolidatedGuideRatingDto>(
    `${getBaseUrl()}/api/${props.space.id}/consolidated-guide-rating`,
    {},
    'Failed to fetch consolidated ratings for guides'
  );

  const ratingDistributions = consolidatedRatings?.positiveRatingDistribution && [
    { name: 'UX', value: +consolidatedRatings?.positiveRatingDistribution.ux.toFixed(2) },
    { name: 'Content', value: +consolidatedRatings?.positiveRatingDistribution.content.toFixed(2) },
    ...[{ name: 'Questions', value: +(consolidatedRatings?.positiveRatingDistribution as RatingDistribution).questions.toFixed(2) }],
  ];
  return (
    <PageWrapper>
      {consolidatedRatings ? (
        <ConsolidatedRatings consolidatedRatings={consolidatedRatings} ratingDistributions={ratingDistributions} />
      ) : (
        <div>No Ratings found </div>
      )}
    </PageWrapper>
  );
}
