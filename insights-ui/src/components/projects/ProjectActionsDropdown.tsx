'use client';

import { regenerateReport } from '@/util/regenerate';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ReportActionsDropdownProps {
  projectId: string;
  postGenerateReport?: (projectId: string, result: { success: boolean; message: string }) => Promise<{ success: boolean; message: string }>;
}

const MODEL_OPTIONS = [{ key: 'o4-mini', label: 'o4-mini' }];

export default function ProjectActionsDropdown({ projectId, postGenerateReport }: ReportActionsDropdownProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit', label: 'Edit' },
    { key: 'debug', label: 'Debug Screen' },
    ...MODEL_OPTIONS.map((model) => ({
      key: `regenerate_${model.key}`,
      label: `Regenerate with ${model.label}`,
    })),
  ];

  return (
    <EllipsisDropdown
      items={actions}
      onSelect={async (key) => {
        if (key === 'debug') {
          router.push(`/crowd-funding/debug/projects/${projectId}`);
        } else if (key === 'edit') {
          router.push(`/crowd-funding/projects/${projectId}/edit`);
        } else if (key.startsWith('regenerate_')) {
          const model = key.replace('regenerate_', '');
          const { success, message } = await regenerateReport(projectId, model);
          postGenerateReport?.(projectId, { success, message });
        }
      }}
    />
  );
}
