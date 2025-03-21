import { fetchPrograms, ProgramsGrid } from '@/app/programs/ProgramsGrid';
import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import HomePage from '@/components/HomePage/HomePage';
import { headers } from 'next/headers';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
async function Home() {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')?.[0];
  const space = (await getSpaceServerSide())!;
  if (host === 'myrubrics.com' || host === 'myrubrics-localhost.com') {
    return <HomePage />;
  }

  const programs = await fetchPrograms();
  const rubrics = await fetchRubrics();
  return (
    <div>
      <ProgramsGrid programs={programs} space={space} />
      <RubricsGrid rubrics={rubrics} space={space} />
    </div>
  );
}

export default Home;
