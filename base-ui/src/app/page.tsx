import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import Homepage from '@/components/homepage/Homepage';

async function Home() {
  const session = await getServerSession();
  const space = await getSpaceServerSide();

  if (session) {
    redirect('/');
  }
  return (
    <>
      <Homepage space={space!} />
    </>
  );
}

export default Home;
