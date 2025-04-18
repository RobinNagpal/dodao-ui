'use client';

import { ProcessingStatus, ReportInterfaceWithType, ReportType } from '@/types/project/project';
import { regenerateReport } from '@/util/regenerate';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ReportActionsDropdownProps {
  projectId: string;
  report?: ReportInterfaceWithType;
  reportType: ReportType;
  postGenerateReport?: (
    projectId: string,
    reportType: ReportType,
    result: { success: boolean; message: string }
  ) => Promise<{ success: boolean; message: string }>;
}

const MODEL_OPTIONS = [{ key: 'o4-mini', label: 'o4-mini' }];

export default function ReportActionsDropdown({ projectId, postGenerateReport, report, reportType }: ReportActionsDropdownProps) {
  const router = useRouter();
  const isRegenerateDisabled = (report: ReportInterfaceWithType): boolean => {
    if (!report.startTime || !report.estimatedTimeInSec) return false; // Regenerate enabled if there's no timing data

    const startTime = new Date(`${report.startTime}Z`).getTime();
    const currentTime = Date.now();
    const estimatedTime = startTime + report.estimatedTimeInSec * 1000;

    return currentTime - startTime < 90 * 1000 && (report.status === ProcessingStatus.IN_PROGRESS || report.status === ProcessingStatus.NOT_STARTED); // Disable if the current time is within the estimated completion time
  };

  const optionsForExistingReport = [
    { key: 'view', label: 'View' },
    ...MODEL_OPTIONS.map((model) => ({
      key: `regenerate_${model.key}`,
      label: `Regenerate with ${model.label}`,
      disabled: !report || isRegenerateDisabled(report),
    })),
  ];

  const optionsForNewReport = MODEL_OPTIONS.map((model) => ({
    key: `regenerate_${model.key}`,
    label: `Generate with ${model.label}`,
  }));

  const actions: EllipsisDropdownItem[] = report ? optionsForExistingReport : optionsForNewReport;

  return (
    <EllipsisDropdown
      items={actions}
      onSelect={async (key) => {
        if (key === 'view') {
          router.push(`/crowd-funding/projects/${projectId}/reports/${reportType}`);
        } else if (key.startsWith('regenerate_')) {
          const model = key.replace('regenerate_', '');
          const { success, message } = await regenerateReport(projectId, model, reportType);
          postGenerateReport?.(projectId, reportType, { success, message });
        }
      }}
      className="pr-4"
    />
  );
}
