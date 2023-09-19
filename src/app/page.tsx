import { OpenAIModelID } from '@/chatbot/types/openai';
import DefaultHome from '@/components/home/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome';
import { getSpaceServerSide } from '@/utils/getSpaceServerSide';
import { headers } from 'next/headers';

import React from 'react';
import ChatHome from '@/chatbot/home/home';
async function Home() {
  const headersList = headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();
  if (host && (space?.botDomains || [])?.includes(host)) {
    return <ChatHome defaultModelId={OpenAIModelID.GPT_3_5} serverSideApiKeyIsSet={true} serverSidePluginKeysSet={false} />;
  }
  if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }
  return <DefaultHome />;
}

export default Home;
