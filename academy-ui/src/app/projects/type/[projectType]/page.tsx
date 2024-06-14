import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ListProjects from '@/components/projects/List/ListProjects';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import { ProjectTypes } from '@dodao/web-core/types/deprecated/models/enums';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

export default async function ProjectListPage(props: {
  params: {
    projectType: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const space = await getSpaceServerSide();
  const type = Object.keys(ProjectTypes).find((key) => key.toLowerCase() === props.params.projectType.toLowerCase());

  const projects = await getApiResponse<ProjectFragment[]>(space!, 'projects');

  const projectsByType = projects.filter((project) => type?.toLowerCase() === 'all' || project.type === type);
  return (
    <PageWrapper>
      <ListProjects space={space!} projects={projectsByType} showArchived={props.searchParams?.['showArchived'] === 'true'} />
    </PageWrapper>
  );
}
