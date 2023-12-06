import PageWrapper from '@/components/core/page/PageWrapper';
import ListProjects from '@/components/projects/ListProjects';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

export default async function ProjectListPage(props: {
  params: {
    projectType: string;
  };
}) {
  const space = await getSpaceServerSide();
  const type = Object.keys(ProjectTypes).find((key) => key.toLowerCase() === props.params.projectType.toLowerCase());

  return (
    <PageWrapper>
      <ListProjects space={space!} type={type!} />
    </PageWrapper>
  );
}
