import ListProjects from '@/components/projects/List/ListProjects';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

export default async function ProjectListPage() {
  const space = await getSpaceServerSide();
  const projects = await getApiResponse<ProjectFragment[]>(space!, 'projects');

  return <ListProjects space={space!} projects={projects} />;
}
