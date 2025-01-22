'use client';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';

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

interface ProjectTableProps {
  projectIds: string[];
}

export default function ProjectTable({ projectIds }: ProjectTableProps) {
  function getSpaceTableRows(projectIds: string[]): TableRow[] {
    const projects: TableRow[] = projectIds.map(
      (projectId): TableRow => ({
        id: projectId,
        columns: [<div key={projectId}>{projectId}</div>],
        item: projectId,
      })
    );
    return projects;
  }
  return (
    <>
      <Table data={getSpaceTableRows(projectIds || [])} columnsHeadings={['Id', 'Status']} columnsWidthPercents={[50, 50]} actions={tableActions} />
    </>
  );
}
