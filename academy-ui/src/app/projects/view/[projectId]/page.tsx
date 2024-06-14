import ByteCollectionsGrid from '@/components/byteCollection/View/ByteCollectionsGrid';
import { ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
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
  const byteCollections = await getApiResponse<ProjectByteCollectionFragment[]>(space, `projects/${props.params.projectId}/byte-collections`);

  const tidbitsCollectionsToShow = byteCollections.filter((bytecollection) => !bytecollection.archived);

  return (
    <ByteCollectionsGrid
      space={space}
      project={project}
      byteCollections={tidbitsCollectionsToShow}
      byteCollectionType={'projectByteCollection'}
      byteCollectionsBaseUrl={`/projects/view/${project?.id}/tidbit-collections`}
    />
  );
}

export default ProjectHomePage;
