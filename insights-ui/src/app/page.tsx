import ProjectTable from '@/components/projects/ProjectTable';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Home() {
  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects`);
  const data = await res.json();

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <div className="sm:flex-auto">
            <h1 className="font-semibold leading-6 text-2xl">Topics</h1>
            <p className="mt-2 text-sm">A list of all the topics.</p>
          </div>
        </div>
        {data && data.projectIds ? (
          <>
            <ProjectTable projectIds={data.projectIds} />
          </>
        ) : (
          <div>No projects to show</div>
        )}
      </div>
    </PageWrapper>
  );
}
