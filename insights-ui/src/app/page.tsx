import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

export default async function Home() {
  const res = await fetch(`${getBaseUrl()}/api/projects`);

  const tableActions: TableActions = {
    items: [
      {
        key: 'view',
        label: 'View',
      },
    ],
    onSelect: async (key: string) => {
      if (key === 'view') {
        console.log('View clicked');
      }
    },
  };

  function getSpaceTableRows(projectIds: string[]): TableRow[] {
    const projects: TableRow[] = projectIds.map(
      (projectId): TableRow => ({
        id: projectId,
        columns: [<div>${projectId}</div>],
        item: projectId,
      })
    );
    return projects;
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="font-semibold leading-6 text-2xl">Projects</h1>
            <p className="mt-2 text-sm">A list of all the projects.</p>
          </div>
        </div>
        <Table
          data={getSpaceTableRows((await res.json()) || [])}
          columnsHeadings={['Name', 'Id', 'Type']}
          columnsWidthPercents={[20, 20, 20]}
          actions={tableActions}
        />
      </div>
    </>
  );
}
