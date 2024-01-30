import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { Metadata } from 'next';
import React from 'react';

type ProjectHomePageProps = {
  params: { projectId: string; viewType: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: ProjectHomePageProps): Promise<Metadata> {
  const id = params.projectId;
  const space = (await getSpaceServerSide())!;
  const project = await getApiResponse<ProjectFragment>(space, `projects/${id}`);
  const seoMeta = project.seoMeta;
  return {
    title: seoMeta?.title,
    description: seoMeta?.description,
    keywords: seoMeta?.keywords,
  };
}

async function ProjectHomePage(props: ProjectHomePageProps) {
  const id = props.params.projectId;
  const space = (await getSpaceServerSide())!;
  const project = await getApiResponse<ProjectFragment>(space, `projects/${id}`);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            <a href={`/projects/view/${project.id}/tidbit-collections`}>See More</a>
          </button>
        </div>
      </div>
    </>
  );
}

export default ProjectHomePage;
