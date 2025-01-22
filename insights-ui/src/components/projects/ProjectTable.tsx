'use client';
import { useRouter } from 'next/navigation';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';

interface ProjectTableProps {
  projectIds: string[];
}

export default function ProjectTable({ projectIds }: ProjectTableProps) {
  const router = useRouter();

  const tableActions: TableActions = {
    items: [
      {
        key: 'view',
        label: 'View',
      },
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${item}`);
      }
    },
  };

  function getSpaceTableRows(projectIds: string[]): TableRow[] {
    return projectIds.map(
      (projectId): TableRow => ({
        id: projectId,
        columns: [
          <div key={projectId} onClick={() => router.push(`/crowd-funding/projects/${projectId}`)} className="cursor-pointer text-blue-600 hover:underline">
            {projectId}
          </div>,
        ],
        item: projectId,
      })
    );
  }

  return <Table data={getSpaceTableRows(projectIds)} columnsHeadings={['Project ID']} columnsWidthPercents={[100]} actions={tableActions} />;
}
