import TopCryptoTopNav from '@/components/projects/Nav/TopCryptoTopNav';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import React from 'react';

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
