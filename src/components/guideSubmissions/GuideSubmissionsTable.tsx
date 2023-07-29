import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import { SpaceWithIntegrationsFragment, useGuideSubmissionsQueryQuery } from '@/graphql/generated/generated-types';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import moment from 'moment';
import { useCallback } from 'react';

export interface GuideSubmissionsTableProps {
  space: SpaceWithIntegrationsFragment;
  guideId: string;
}
export default function GuideSubmissionsTable(props: GuideSubmissionsTableProps) {
  const { data, loading } = useGuideSubmissionsQueryQuery({
    variables: {
      spaceId: props.space.id,
      guideUuid: props.guideId,
      filters: {
        page: 0,
        itemsPerPage: 20,
      },
    },
  });

  const guideSubmissions = data?.guideSubmissions;

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

  if (loading) {
    return <SpinnerWithText message="Loading Guide Submissions" />;
  }

  if (!guideSubmissions || guideSubmissions.length === 0) {
    return <div>No Guide Submissions</div>;
  }

  const rowData = guideSubmissions.map((submission) => {
    return {
      id: submission.id,
      createdAt: new Date(submission.createdAt),
      createdBy: submission.createdBy,
      correctQuestionsCount: submission.correctQuestionsCount,
    };
  });

  return (
    <div
      className="ag-theme-alpine flex-grow h-max"
      style={{
        height: '500px',
        width: '100%',
      }}
    >
      <AgGridReact
        onFilterOpened={onFilterOpened}
        onFilterChanged={onFilterChanged}
        onFilterModified={onFilterModified}
        columnDefs={[
          { headerName: 'ID', field: 'id' },
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
          },
          {
            headerName: 'Correct Questions',
            field: 'correctQuestionsCount',
            filter: 'agNumberColumnFilter',
            filterParams: {
              buttons: ['apply', 'cancel'],
              closeOnApply: true,
              filterOptions: ['equals', 'lessThan', 'greaterThan'],
              maxNumConditions: 1,
            },
          },
        ]}
        rowData={rowData}
      />
    </div>
  );
}
