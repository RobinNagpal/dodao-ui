'use client';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import {
  ByteRating,
  SpaceWithIntegrationsFragment,
  useConsolidatedByteRatingQuery,
  useByteRatingsQuery,
  useQueryByteDetailsQuery,
} from '@/graphql/generated/generated-types';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import React, { useCallback } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';
import styles from './ByteRatingsTable.module.scss';

export interface ByteRatingsTableProps {
  space: SpaceWithIntegrationsFragment;
  byteId: string;
}

export default function ByteRatingsTable(props: ByteRatingsTableProps) {
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

  const positiveRatingDistribution = consolidatedRatingsResponse?.consolidatedByteRating?.positiveRatingDistribution;

  const ratingDistributions = positiveRatingDistribution && [
    { name: 'UX', value: +positiveRatingDistribution.ux.toFixed(2) },
    { name: 'Content', value: +positiveRatingDistribution.content.toFixed(2) },
  ];

  const { data: byteResponse } = useQueryByteDetailsQuery({
    variables: {
      spaceId: props.space.id,
      byteId: props.byteId,
    },
  });
  const byteRatings: ByteRating[] = byteRatingsResponse?.byteRatings || [];

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

  if (loadingByteRatings) {
    return <SpinnerWithText message="Loading Byte Ratings" />;
  }

  if (!byteRatings || byteRatings.length === 0) {
    return <div>No Byte Ratings</div>;
  }

  const rowData = byteRatings.map((rating) => {
    return {
      id: rating.ratingUuid,
      createdAt: new Date(rating.createdAt),
      createdBy: rating.username || rating.userId || 'anonymous',
      rating: rating.rating,
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

  const averageRating = consolidatedRatingsResponse?.consolidatedByteRating?.avgRating?.toFixed(2);
  return (
    <div className="w-full">
      <h1 className="text-center text-2xl">{byteResponse?.byte.name}</h1>
      <p className="text-center text-xs">{byteResponse?.byte.content}</p>
      {byteRatings && (
        <Grid2Cols className="my-12">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-center w-full">Average Byte Ratings</h2>
            <div className="py-24 sm:py-32">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl>
                  <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                    <dt className="text-base leading-7">{consolidatedRatingsResponse?.consolidatedByteRating?.ratingFeedbackCount || 0} Ratings Submitted</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight sm:text-5xl">{averageRating ? `${averageRating} / 5` : 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div className={`text-center w-full flex flex-col justify-center items-center ${styles.reChartsWrapper}`}>
            <h2 className="text-xl font-bold w-full">What did you like the most?</h2>
            {ratingDistributions && (
              <PieChart width={350} height={350}>
                <Pie dataKey="value" isAnimationActive={false} data={ratingDistributions} cx={150} cy={150} outerRadius={120} fill="#8884d8" label>
                  {ratingDistributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </div>
        </Grid2Cols>
      )}
      <div
        className={`ag-theme-alpine flex-grow h-max text-xs ${styles.reChartsWrapper}`}
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
      </div>
    </div>
  );
}
