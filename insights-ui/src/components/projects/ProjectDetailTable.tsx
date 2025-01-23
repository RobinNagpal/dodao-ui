'use client';

import { ReportWithName, Status } from '@/types/project/project';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { regenerateReport } from '@/util/regenerate';

interface ProjectDetailTableProps {
  reports: ReportWithName[];
  projectId: string;
}

export default function ProjectDetailTable({ reports, projectId }: ProjectDetailTableProps) {
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
    onSelect: async (key: string, item: ReportWithName) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${projectId}/reports/${item.name}`);
      } else if (key === 'regenerate') {
        const { success, message } = await regenerateReport(projectId, item.name);
        success ? router.refresh() : alert(message);
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
        <div key={`${report.name}-status`}>
          {report.status === Status.completed ? (
            <div className="flex gap-2">
              {report.pdfLink && (
                <>
                  <a href={report.pdfLink} target="_blank" rel="noopener noreferrer" className="link-color hover:underline">
                    PDF
                  </a>
                  <span>|</span>
                </>
              )}
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
      <Table data={getSpaceTableRows(reports)} columnsHeadings={['Report Name', 'Status / Links']} columnsWidthPercents={[50, 50]} actions={tableActions} />
    </div>
  );
}
