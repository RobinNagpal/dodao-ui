'use client';

import styles from '@/components/app/Rating/Table/RatingsTable.module.scss';
import getBaseUrl from '@/utils/api/getBaseURL';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ConsolidatedByteRating, ConsolidatedByteRatingsForSpaceQuery, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function ConsolidatedRatings(props: { consolidatedRatings: ConsolidatedByteRating; ratingDistributions: any }) {
  const { consolidatedRatings } = props;
  return (
    <Grid2Cols className="my-12">
      <div className="text-center w-full">
        <h2 className="text-xl font-bold text-center w-full">{`Average Tidbit Ratings`}</h2>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl>
              <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7">{consolidatedRatings.ratingFeedbackCount} Ratings Submitted</dt>
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

export default function ConsolidatedByteRatings(props: { space: SpaceWithIntegrationsFragment }) {
  const [consolidatedRatingsResponse, setConsolidatedRatingsResponse] = React.useState<ConsolidatedByteRatingsForSpaceQuery>();

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${getBaseUrl()}/api/byte/consolidate-byte-ratings-for-space`, {
        params: {
          spaceId: props.space.id,
        },
      });
      setConsolidatedRatingsResponse(response.data);
    }
    fetchData();
  }, [props.space.id]);

  const consolidatedByteRatingsForSpace = consolidatedRatingsResponse?.consolidatedByteRatingsForSpace;
  const positiveRatingDistribution = consolidatedByteRatingsForSpace?.positiveRatingDistribution;
  console.log('consolidatedByteRatingsForSpace', consolidatedRatingsResponse);

  const ratingDistributions = positiveRatingDistribution && [
    { name: 'UX', value: +positiveRatingDistribution.ux?.toFixed(2) },
    { name: 'Content', value: +positiveRatingDistribution.content?.toFixed(2) },
  ];
  return (
    <PageWrapper>
      {consolidatedByteRatingsForSpace ? (
        <ConsolidatedRatings consolidatedRatings={consolidatedByteRatingsForSpace} ratingDistributions={ratingDistributions} />
      ) : (
        <div>No Ratings found </div>
      )}
    </PageWrapper>
  );
}
