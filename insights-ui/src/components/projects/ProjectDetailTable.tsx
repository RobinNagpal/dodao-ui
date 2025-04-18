'use client';

import { ReportWithName, ProcessingStatus } from '@/types/project/project';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { regenerateReport } from '@/util/regenerate';
import LoadingSpinner from '@dodao/web-core/components/core/loaders/LoadingSpinner';
import { isAdmin } from '@/util/auth/isAdmin';

interface ProjectDetailTableProps {
  reports: ReportWithName[];
  projectId: string;
  reload: () => void;
}

const MODEL_OPTIONS = [
  { key: 'o4-mini', label: 'o4-mini' },
  { key: 'gpt-4o-mini', label: 'gpt-4o-mini' },
];

export default function ProjectDetailTable({ reports, projectId, reload }: ProjectDetailTableProps) {
  const router = useRouter();

  const isRegenerateDisabled = (report: ReportWithName): boolean => {
    if (!report.startTime || !report.estimatedTimeInSec) return false; // Regenerate enabled if there's no timing data

    const startTime = new Date(`${report.startTime}Z`).getTime();
    const currentTime = Date.now();
    const estimatedTime = startTime + report.estimatedTimeInSec * 1000;

    return currentTime - startTime < 90 * 1000 && (report.status === ProcessingStatus.IN_PROGRESS || report.status === ProcessingStatus.NOT_STARTED); // Disable if the current time is within the estimated completion time
  };

  const tableActions: TableActions = {
    items: (report: ReportWithName) => [
      ...MODEL_OPTIONS.map((model) => ({
        key: `regenerate_${model.key}`,
        label: `Regenerate with ${model.label}`,
        disabled: isRegenerateDisabled(report),
      })),
    ],
    onSelect: async (key: string, item: ReportWithName) => {
      if (key.startsWith('regenerate_')) {
        const model = key.replace('regenerate_', '');
        const { success, message } = await regenerateReport(projectId, model, item.name);
        success ? reload() : alert(message);
      }
    },
  };
  function getSpaceTableRows(reports: ProjectDetailTableProps['reports']): TableRow[] {
    return reports.map((report) => ({
      id: report.name,
      columns: [
        // Report name
        <div key={`${report.name}-name`}>{report.name}</div>,

        // Status or Links
        <div key={`${report.name}-status`} className="flex items-center gap-2">
          {report.status === ProcessingStatus.IN_PROGRESS ? (
            <>
              <span className="mr-2">{report.status}</span>
              <LoadingSpinner />
            </>
          ) : report.status === ProcessingStatus.COMPLETED ? (
            <div className="flex gap-2">
              {report.markdownLink && (
                <Link
                  href={`/crowd-funding/projects/${encodeURIComponent(projectId)}/reports/${encodeURIComponent(report.name)}`}
                  className="link-color hover:underline"
                >
                  View
                </Link>
              )}
            </div>
          ) : (
            <span>{report.status}</span>
          )}
        </div>,
      ],
      item: report,
    }));
  }

  return (
    <div className="mt-6">
      <Table
        data={getSpaceTableRows(reports)}
        columnsHeadings={['Report Name', 'Status / Links']}
        columnsWidthPercents={[50, 50]}
        actions={isAdmin() ? tableActions : undefined}
      />
    </div>
  );
}
