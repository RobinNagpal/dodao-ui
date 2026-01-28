import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import DefaultHome from '@/components/home/DefaultHome/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome/DoDAOHome';
import TidbitsHubHome from '@/components/home/TidbitsHub/TidbitsHubHome';
import { getTidbitsSiteHomepageContents } from '@/components/home/TidbitsSite/getTidbitsSiteHomepageContents';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { getMetaTags } from '@/utils/metaTags/metaTagsInfo';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import { Session } from '@dodao/web-core/types/auth/Session';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import React from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const space = await getSpaceServerSide();

  if (space) {
    return getMetaTags(space);
  }
  return {
    title: 'DoDAO – Building AI Agents & DeFi Tools',
    description: 'DoDAO helps teams build, deploy, and train AI Agents and DeFi tools for real-world use cases in finance, education, and Web3.',
  };
}

async function Home() {
  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session;

  if (space?.type === SpaceTypes.TidbitsSite) {
    return await getTidbitsSiteHomepageContents(space, session);
  }

  if (space?.id === PredefinedSpaces.DODAO_HOME) {
    return <DoDAOHome />;
  }

  if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    return <TidbitsHubHome space={space!} />;
  }

  return <DefaultHome space={space!} />;
}

export default Home;
