'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { regenerateReport } from '@/util/regenerate';

interface ElipsisProps {
  projectId: string;
}

const MODEL_OPTIONS = [
  { key: 'gpt-4o', label: 'gpt-4o' },
  { key: 'gpt-4o-mini', label: 'gpt-4o-mini' },
];

const Elipsis: React.FC<ElipsisProps> = ({ projectId }) => {
  const router = useRouter();

  const tableActions = {
    items: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      ...MODEL_OPTIONS.map((model) => ({
        key: `regenerate_${model.key}`,
        label: `Regenerate with ${model.label}`,
      })),
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${item}`);
      } else if (key === 'edit') {
        router.push(`/crowd-funding/projects/${item}/edit`);
      } else if (key.startsWith('regenerate_')) {
        const model = key.replace('regenerate_', '');
        const { success, message } = await regenerateReport(item, model);
        success ? router.refresh() : alert(message);
      }
    },
  };

  return (
    <div className="absolute top-2 right-2 py-2 pl-3 pr-4 text-right font-medium sm:pr-0">
      <EllipsisDropdown
        items={tableActions.items}
        onSelect={(key) => {
          tableActions.onSelect(key, projectId);
        }}
      />
    </div>
  );
};

export default Elipsis;
