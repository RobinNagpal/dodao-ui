import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SpaceWithIntegrationsFragment, useGuideSubmissionsQueryQuery } from '@/graphql/generated/generated-types';
import { DODAO_ACCESS_TOKEN_KEY } from '@/types/deprecated/models/enums';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

const AgGridWrapper = styled.div``;
export interface GuideSubmissionsTableProps {
  space: SpaceWithIntegrationsFragment;
  guideId: string;
}

const DownloadWrapper = styled.div`
  color: var(--text-color);
`;

export default function GuideSubmissionsTable(props: GuideSubmissionsTableProps) {
  const [csvDownloading, setCsvDownloading] = useState(false);

  const { showNotification } = useNotificationContext();
  const downloadCSV = async () => {
    try {
      setCsvDownloading(true);
      const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/download-guide-submissions-csv-new', {
        params: {
          spaceId: props.space.id,
          guideUuid: props.guideId,
        },
        responseType: 'blob',
        headers: {
          'dodao-auth-token': localStorage.getItem(DODAO_ACCESS_TOKEN_KEY) || '',
        },
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'guide_submissions.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showNotification({
        type: 'error',
        message: 'Failed to download CSV.',
      });
    } finally {
      setCsvDownloading(false);
    }
  };
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
      <DownloadWrapper className="w-full flex justify-end mb-4">
        <IconButton iconName={IconTypes.ArrowDownTrayIcon} loading={csvDownloading} size="large" onClick={() => downloadCSV()} />
      </DownloadWrapper>
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
