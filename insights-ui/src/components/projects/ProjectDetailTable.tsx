'use client';
import { Status, ReportInterface } from '@/types/project/project';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import React from 'react';

interface ProjectDetailTableProps {
  reports: { name: string; status: Status; markdownLink: string | null; pdfLink: string | null }[];
}

export default function ProjectDetailTable({ reports }: ProjectDetailTableProps) {
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
                  <a href={report.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    PDF
                  </a>
                  <span>|</span>
                </>
              )}
              {report.markdownLink && (
                <a href={report.markdownLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  MD
                </a>
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
      <Table data={getSpaceTableRows(reports)} columnsHeadings={['Report Name', 'Status / Links']} columnsWidthPercents={[50, 50]} />
    </div>
  );
}
