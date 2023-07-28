import SpinnerWithText from '@/components/core/loaders/SpinnerWithText';
import { SpaceWithIntegrationsFragment, useGuideSubmissionsQueryQuery } from '@/graphql/generated/generated-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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

  if (loading) {
    return <SpinnerWithText message="Loading Guide Submissions" />;
  }

  if (!guideSubmissions || guideSubmissions.length === 0) {
    return <div>No Guide Submissions</div>;
  }

  const rowData = guideSubmissions.map((submission) => {
    return {
      id: submission.id,
      createdAt: submission.createdAt,
      createdBy: submission.createdBy,
      correctQuestionsCount: submission.correctQuestionsCount,
    };
  });

  return (
    <div
      className="ag-theme-alpine"
      style={{
        height: '500px',
        width: '100%',
      }}
    >
      <AgGridReact
        columnDefs={[
          { headerName: 'ID', field: 'id' },
          { headerName: 'Created At', field: 'createdAt' },
          { headerName: 'Created By', field: 'createdBy' },
          { headerName: 'Correct Questions', field: 'correctQuestionsCount' },
        ]}
        rowData={rowData}
      />
    </div>
  );
}
