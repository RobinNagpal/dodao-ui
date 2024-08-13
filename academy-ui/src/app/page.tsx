import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import ChatHome from '@/chatbot/home/home';
import { OpenAIModelID } from '@/chatbot/types/openai';
import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import DefaultHome from '@/components/home/DefaultHome/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome/DoDAOHome';
import LifeInsureHomePage from '@/components/home/LifeInsure/LifeInsureHomePage';
import TidbitsHubHome from '@/components/home/TidbitsHub/TidbitsHubHome';
import { getTidbitsSiteHomepageContents } from '@/components/home/TidbitsSite/getTidbitsSiteHomepageContents';
import { SpaceTypes } from '@/graphql/generated/generated-types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import React from 'react';

async function Home(props: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const headersList = headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session;
  if (host && (space?.botDomains || [])?.includes(host)) {
    return <ChatHome defaultModelId={OpenAIModelID.GPT_3_5} serverSideApiKeyIsSet={true} serverSidePluginKeysSet={false} isChatbotSite={true} />;
  }

  if (space?.type === SpaceTypes.TidbitsSite) {
    return await getTidbitsSiteHomepageContents(space, session);
  }

  if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }

  if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    return <TidbitsHubHome />;
  }

  if (space?.id === 'life-insurance-tips') {
    return <LifeInsureHomePage />;
  }

  return <DefaultHome space={space!} />;
}

export default Home;
