import ChatHome from '@/chatbot/home/home';
import { OpenAIModelID } from '@/chatbot/types/openai';
import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import PageWrapper from '@/components/core/page/PageWrapper';
import DefaultHome from '@/components/home/DefaultHome/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome/DoDAOHome';
import LifeInsureHomePage from '@/components/home/LifeInsure/LifeInsureHomePage';
import TidbitsHubHome from '@/components/home/TidbitsHub/TidbitsHubHome';
import TidbitsSiteHome from '@/components/home/TidbitsSite/TidbitsSiteHome';
import ListProjects from '@/components/projects/List/ListProjects';
import { ProjectFragment, SpaceTypes } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { headers } from 'next/headers';

import React from 'react';

async function Home(props: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const headersList = headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();
  if (host && (space?.botDomains || [])?.includes(host)) {
    return <ChatHome defaultModelId={OpenAIModelID.GPT_3_5} serverSideApiKeyIsSet={true} serverSidePluginKeysSet={false} isChatbotSite={true} />;
  }

  if (space?.id === PredefinedSpaces.CRYPTO_GELATO) {
    const projects = await getApiResponse<ProjectFragment[]>(space, 'projects');
    const showArchived = props.searchParams?.['showArchived'] === 'true';
    return (
      <PageWrapper>
        <ListProjects space={space} projects={projects} showArchived={showArchived} />
      </PageWrapper>
    );
  }

  if (space?.type === SpaceTypes.TidbitsSite) {
    return <TidbitsSiteHome />;
  }

  if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }

  if (space?.id === 'tidbitshub') {
    return <TidbitsHubHome />;
  }

  if (space?.id === 'life-insurance-tips') {
    return <LifeInsureHomePage />;
  }

  return <DefaultHome space={space!} />;
}

export default Home;
