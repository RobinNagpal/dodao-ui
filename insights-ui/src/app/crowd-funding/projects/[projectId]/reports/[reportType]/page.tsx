import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Markdown from 'react-markdown';

export default async function ReportDetailPage({ params }: { params: Promise<{ projectId: string; reportType: string }> }) {
  const { projectId, reportType } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/reports/${reportType}`);

  const data: { reportDetail: string } = await res.json();

  return (
    <PageWrapper>
      <div className="mx-auto max-w-4xl text-color">
        <div className="text-center text-color my-5">
          <h1 className="font-semibold leading-6 text-2xl">Project: {projectId}</h1>
          <div className="my-5">Report: {reportType}</div>
        </div>
        <div className="block-bg-color p-8">
          <Markdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4 text-center" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-xl font-medium my-3" {...props} />,
              p: ({ node, ...props }) => <p className="font-thin my-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
              li: ({ node, ...props }) => <li className="ml-4" {...props} />,
            }}
          >
            {data.reportDetail}
          </Markdown>
        </div>
      </div>
    </PageWrapper>
  );
}
