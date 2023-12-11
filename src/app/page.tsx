import { OpenAIModelID } from '@/chatbot/types/openai';
import { TOP_CRYPTO_PROJECTS_SPACE_ID } from '@/chatbot/utils/app/constants';
import DefaultHome from '@/components/home/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import React from 'react';
import ChatHome from '@/chatbot/home/home';
async function Home() {
  const headersList = headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();
  if (host && (space?.botDomains || [])?.includes(host)) {
    return <ChatHome defaultModelId={OpenAIModelID.GPT_3_5} serverSideApiKeyIsSet={true} serverSidePluginKeysSet={false} isChatbotSite={true} />;
  }

  if (space?.id === TOP_CRYPTO_PROJECTS_SPACE_ID) {
    redirect('/projects/type/defi');
  }

  if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }
  return <DefaultHome space={space!} />;
}

export default Home;
