import PageWrapper from '@/components/core/page/PageWrapper';
import ListProjects from '@/components/projects/ListProjects';
import { ProjectTypes } from '@/types/deprecated/models/enums';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

export default async function ProjectListPage() {
  const space = await getSpaceServerSide();

  return <ListProjects space={space!} type={'All'} />;
}
