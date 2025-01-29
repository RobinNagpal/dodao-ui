'use client';
import { useRouter } from 'next/navigation';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';
import Link from 'next/link';
import { regenerateReport } from '@/util/regenerate';

interface ProjectTableProps {
  projectIds: string[];
}

const MODEL_OPTIONS = [
  { key: 'gpt-4o', label: 'gpt-4o' },
  { key: 'gpt-4o-mini', label: 'gpt-4o-mini' },
];

export default function ProjectTable({ projectIds }: ProjectTableProps) {
  const router = useRouter();

  const tableActions: TableActions = {
    items: [
      { key: 'view', label: 'View' },
      ...MODEL_OPTIONS.map((model) => ({
        key: `regenerate_${model.key}`,
        label: `Regenerate with ${model.label}`,
      })),
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${item}`);
      } else if (key.startsWith('regenerate_')) {
        const model = key.replace('regenerate_', '');
        const { success, message } = await regenerateReport(item, model);
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
