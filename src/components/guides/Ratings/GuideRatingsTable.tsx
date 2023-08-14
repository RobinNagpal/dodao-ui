import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import { GuideRating, SpaceWithIntegrationsFragment, useConsolidatedGuideRatingQuery, useGuideRatingsQuery } from '@/graphql/generated/generated-types';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

interface RatingDistribution {
  ux: number;
  content: number;
  questions: number;
}

interface Props {
  distribution: RatingDistribution;
}

const AgGridWrapper = styled.div`
  width: 100%;
`;

export interface GuideRatingsTableProps {
  space: SpaceWithIntegrationsFragment;
  guideId: string;
}

const ReChartsWrapper = styled.div`
  .recharts-wrapper {
    margin: 0 auto;
  }
`;

export default function GuideRatingsTable(props: GuideRatingsTableProps) {
  const { data: guideRatingsResponse, loading: loadingGuideRatings } = useGuideRatingsQuery({
    variables: {
      spaceId: props.space.id,
      guideUuid: props.guideId,
    },
  });

  const { data: consolidatedRatingsResponse, loading: loadingConsolidatedRatings } = useConsolidatedGuideRatingQuery({
    variables: {
      spaceId: props.space.id,
      guideUuid: props.guideId,
    },
  });

  const positiveRatingDistribution = consolidatedRatingsResponse?.consolidatedGuideRating?.positiveRatingDistribution;

  const ratingDistributions = positiveRatingDistribution && [
    { name: 'UX', value: +positiveRatingDistribution.ux.toFixed(2) },
    { name: 'Content', value: +positiveRatingDistribution.content.toFixed(2) },
    { name: 'Questions', value: +positiveRatingDistribution.questions.toFixed(2) },
  ];

  const guideRatings: GuideRating[] = guideRatingsResponse?.guideRatings || [];

  const onFilterOpened = useCallback((e: FilterOpenedEvent<any>) => {
    console.log('onFilterOpened', e);
  }, []);

  const onFilterChanged = useCallback((e: FilterChangedEvent<any>) => {
    console.log('onFilterChanged', e);
    console.log('gridRef.current.api.getFilterModel() =>', e.api.getFilterModel());
  }, []);

  const onFilterModified = useCallback((e: FilterModifiedEvent<any>) => {
    console.log('onFilterModified', e);
    console.log('filterInstance.getModel() =>', e.filterInstance.getModel());
  }, []);

  if (loadingGuideRatings) {
    return <SpinnerWithText message="Loading Guide Ratings" />;
  }

  if (!guideRatings || guideRatings.length === 0) {
    return <div>No Guide Ratings</div>;
  }

  const rowData = guideRatings.map((rating) => {
    return {
      id: rating.ratingUuid,
      createdAt: new Date(rating.createdAt),
      createdBy: rating.username || rating.userId || 'anonymous',
      rating: rating.endRating,
      positiveFeedback: rating.positiveFeedback
        ? Object.entries(rating.positiveFeedback)
            .filter((e) => e?.[1] === true || e?.[1] === 'true')
            .map((e) => e[0])
            .join(', ')
        : '',
    };
  });
  const gridOptions: GridOptions = {
    onGridSizeChanged(event: GridSizeChangedEvent<any>) {
      event.api.sizeColumnsToFit();
    },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="w-full">
      {guideRatings && (
        <Grid2Cols className="my-12">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-center w-full">Average Guide Ratings</h2>
            <div className="bg-white py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl>
                  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                    <dt className="text-base leading-7 text-gray-600">
                      {consolidatedRatingsResponse?.consolidatedGuideRating?.endRatingFeedbackCount || 0} Ratings Submitted
                    </dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                      {consolidatedRatingsResponse?.consolidatedGuideRating?.avgRating?.toFixed(2) || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <ReChartsWrapper className="text-center w-full">
            <h2 className="text-xl font-bold w-full">What did you like the most?</h2>
            {ratingDistributions && (
              <PieChart width={400} height={400}>
                <Pie dataKey="value" isAnimationActive={false} data={ratingDistributions} cx={200} cy={200} outerRadius={120} fill="#8884d8" label>
                  {ratingDistributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ReChartsWrapper>
        </Grid2Cols>
      )}
      <AgGridWrapper
        className="ag-theme-alpine flex-grow h-max text-xs"
        style={{
          minHeight: 'calc(100vh - 200px)',
          height: '500px',
          width: '100%',
        }}
      >
        <AgGridReact
          onFilterOpened={onFilterOpened}
          onFilterChanged={onFilterChanged}
          onFilterModified={onFilterModified}
          gridOptions={gridOptions}
          columnDefs={[
            { headerName: 'ID', field: 'id', width: 150, cellStyle: { fontSize: '12px' } },
            {
              headerName: 'Created At',
              field: 'createdAt',

              filter: 'agDateColumnFilter',
              filterParams: {
                buttons: ['apply', 'cancel'],
                closeOnApply: true,
                filterOptions: ['equals', 'lessThan', 'greaterThan'],
                maxNumConditions: 1,
              },

              cellRenderer: (data: any) => {
                return moment(data.value).format('MM/DD/YYYY HH:mm');
              },
              cellStyle: { fontSize: '12px' },
              width: 200,
            },
            {
              headerName: 'Created By',
              field: 'createdBy',
              filter: 'agTextColumnFilter',
              filterParams: {
                buttons: ['apply', 'cancel'],
                closeOnApply: true,
                filterOptions: ['equals'],
                maxNumConditions: 1,
              },
              width: 400,
              cellStyle: { fontSize: '12px' },
            },
            {
              headerName: 'Rating',
              field: 'rating',
              filter: 'agNumberColumnFilter',
              filterParams: {
                buttons: ['apply', 'cancel'],
                closeOnApply: true,
                filterOptions: ['equals', 'lessThan', 'greaterThan'],
                maxNumConditions: 1,
              },
              wrapText: true, // <-- HERE
              autoHeight: true, // <-- & HERE
              wrapHeaderText: true,
              cellStyle: { fontSize: '12px' },
              width: 50,
            },
            {
              headerName: 'What did you like the most?',
              field: 'positiveFeedback',
              filter: 'agTextColumnFilter',
              filterParams: {
                buttons: ['apply', 'cancel'],
                closeOnApply: true,
                filterOptions: ['equals'],
                maxNumConditions: 1,
              },
              wrapText: true, // <-- HERE
              autoHeight: true, // <-- & HERE
              cellStyle: { fontSize: '12px' },
            },
          ]}
          rowData={rowData}
        />
      </AgGridWrapper>
    </div>
  );
}
