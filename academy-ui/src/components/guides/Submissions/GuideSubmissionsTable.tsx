'use client';

import { GuideSubmission } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import SpinnerWithText from '@dodao/web-core/components/core/loaders/SpinnerWithText';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from 'ag-grid-community/dist/lib/events';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './GuideSubmissionsTable.module.scss';

export interface GuideSubmissionsTableProps {
  space: SpaceWithIntegrationsDto;
  guideId: string;
}

export default function GuideSubmissionsTable(props: GuideSubmissionsTableProps) {
  const [csvDownloading, setCsvDownloading] = useState(false);
  const [data, setData] = useState<{ guideSubmissions?: GuideSubmission[] }>();
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotificationContext();
  const downloadCSV = async () => {
    try {
      setCsvDownloading(true);
      const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/download-guide-submissions-csv', {
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await axios.get(`${getBaseUrl()}/api/guide/guide-submit`, {
          params: {
            spaceId: props.space.id,
            guideId: props.guideId,
            filters: JSON.stringify({
              page: 0,
              itemsPerPage: 2000,
            }),
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching guide submissions:', error);
      }
    }
    fetchData();
  }, [props.space.id, props.guideId]);

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
    <div className="w-full">
      <div className={`w-full flex justify-end mb-4 ${styles.downloadWrapper}`}>
        <IconButton iconName={IconTypes.ArrowDownTrayIcon} loading={csvDownloading} onClick={() => downloadCSV()} />
      </div>
      <div
        className={`ag-theme-alpine flex-grow h-max text-xs ${styles.agGridWrapper}`}
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
      </div>
    </div>
  );
}
