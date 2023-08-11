import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import { SpaceWithIntegrationsFragment, useGuideSubmissionsQueryQuery } from '@/graphql/generated/generated-types';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import moment from 'moment';
import { useCallback } from 'react';
import styled from 'styled-components';

const AgGridWrapper = styled.div``;
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
        itemsPerPage: 2000,
      },
    },
  });

  const guideSubmissions = data?.guideSubmissions || [];

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
      createdBy: submission.createdByUsername,
      correctQuestionsCount: submission.correctQuestionsCount,
      userResponses: submission.steps
        ?.flatMap((step) => step.itemResponses)
        .filter((itemResponse) => itemResponse.userInput)
        .map((response) => response.userInput || '')
        .join(', '),
    };
  });
  const gridOptions: GridOptions = {
    onGridSizeChanged(event: GridSizeChangedEvent<any>) {
      event.api.sizeColumnsToFit();
    },
  };

  return (
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
          { headerName: 'ID', field: 'id', width: 50, cellStyle: { fontSize: '12px' } },
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
            width: 80,
            cellStyle: { fontSize: '12px' },
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
            width: 160,
            cellStyle: { fontSize: '12px' },
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
            width: 50,
            wrapText: true, // <-- HERE
            autoHeight: true, // <-- & HERE
            wrapHeaderText: true,
            cellStyle: { fontSize: '12px' },
          },
          {
            headerName: 'Responses',
            field: 'userResponses',
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
  );
}
