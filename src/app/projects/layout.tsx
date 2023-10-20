import PageWrapper from '@/components/core/page/PageWrapper';
import ProjectTopNav from '@/components/projects/Nav/ProjectTopNav';
import TopCryptoTopNav from '@/components/projects/Nav/TopCryptoTopNav';
import { getProjectUsingAPI } from '@/utils/api/getProjectUsingAPI';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';

async function ProjectViewHome(props: { children: React.ReactNode }) {
  const space = await getSpaceServerSide();

  return (
    <div>
      <TopCryptoTopNav space={space!} />
      {props.children}
    </div>
  );
}

export default ProjectViewHome;
