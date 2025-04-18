'use client';
import { useRouter } from 'next/navigation';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';
import Link from 'next/link';
import { regenerateReport } from '@/util/regenerate';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { isAdmin } from '@/util/auth/isAdmin';

interface ProjectTableProps {
  projectIds: string[];
}

const MODEL_OPTIONS = [{ key: 'o4-mini', label: 'o4-mini' }];

export default function ProjectTable({ projectIds }: ProjectTableProps) {
  const router = useRouter();

  const tableActions: TableActions = {
    items: [
      { key: 'edit', label: 'Edit' },
      ...MODEL_OPTIONS.map((model) => ({
        key: `regenerate_${model.key}`,
        label: `Regenerate with ${model.label}`,
      })),
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'edit') {
        router.push(`/crowd-funding/projects/${item}/edit`);
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

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            router.push(`/crowd-funding/projects/create`);
          }}
          className="m-4"
          variant="contained"
          primary
        >
          Add New Project
        </Button>
      </div>
      <div className="block-bg-color">
        <Table
          data={getSpaceTableRows(projectIds)}
          columnsHeadings={['Project ID']}
          columnsWidthPercents={[100]}
          actions={isAdmin() ? tableActions : undefined}
        />
      </div>
    </>
  );
}
