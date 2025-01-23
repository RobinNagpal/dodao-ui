import ProjectTable from '@/components/projects/ProjectTable';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function Home() {
  const apiUrl = `${getBaseUrl()}/api/crowd-funding/projects`;
  const res = await fetch(apiUrl);
  const data = await res.json();

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <div className="sm:flex-auto">
            <h1 className="font-semibold leading-6 text-2xl text-color">Crowd Funding Projects</h1>
            <p className="mt-2 text-sm text-color">A list of all the projects.</p>
          </div>
        </div>
        {data.projectIds.length > 0 ? (
          <>
            <ProjectTable projectIds={data.projectIds} />
          </>
        ) : (
          <div className="text-color text-center">No projects to show</div>
        )}
      </div>
    </PageWrapper>
  );
}
