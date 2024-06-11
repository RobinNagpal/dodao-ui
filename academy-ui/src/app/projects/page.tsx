import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ListProjects from '@/components/projects/List/ListProjects';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@dodao/web-core/api/auth/getSpaceServerSide';

export default async function ProjectListPage(props: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const space = await getSpaceServerSide();
  const projects = await getApiResponse<ProjectFragment[]>(space!, 'projects');

  return (
    <PageWrapper>
      <ListProjects space={space!} projects={projects} showArchived={props.searchParams?.['showArchived'] === 'true'} />
    </PageWrapper>
  );
}
