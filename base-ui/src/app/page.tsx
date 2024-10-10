import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import GetStarted from '@/components/getStarted/GetStarted';

async function Home() {
  const session = await getServerSession();
  const space = await getSpaceServerSide();

  if (session) {
    redirect('/homepage');
  }
  return (
    <>
      <GetStarted space={space!} />
    </>
  );
}

export default Home;
