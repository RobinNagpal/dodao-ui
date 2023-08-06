import DefaultHome from '@/components/home/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome';
import { headers } from 'next/headers';
import React from 'react';

export default function Home() {
  const headersList = headers();
  const host = headersList.get('host');
  console.log('host', host);

  if (host === 'dodao-localhost.io:3000' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }
  return <DefaultHome />;
}
