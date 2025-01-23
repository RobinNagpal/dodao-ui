'use client';
import { useRouter } from 'next/navigation';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';
import Link from 'next/link';
import { regenerateReport } from '@/util/regenerate';

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
      {
        key: 'regenerate',
        label: 'Regenerate',
      },
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${item}`);
      } else if (key === 'regenerate') {
        const { success, message } = await regenerateReport(item);
        success ? router.refresh() : alert(message);
      }
    },
  };

  function getSpaceTableRows(projectIds: string[]): TableRow[] {
    return projectIds.map(
      (projectId): TableRow => ({
        id: projectId,
        columns: [
          <Link href={`/crowd-funding/projects/${encodeURIComponent(projectId)}`} key={projectId} className="link-color hover:underline">
            {projectId}
          </Link>,
        ],
        item: projectId,
      })
    );
  }

  return <Table data={getSpaceTableRows(projectIds)} columnsHeadings={['Project ID']} columnsWidthPercents={[100]} actions={tableActions} />;
}
