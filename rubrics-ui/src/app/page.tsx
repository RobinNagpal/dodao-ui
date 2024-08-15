import { fetchPrograms, ProgramsGrid } from '@/app/programs/ProgramsGrid';
import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import HomePage from '@/components/HomePage/HomePage';
import { headers } from 'next/headers';
import React from 'react';

async function Home() {
  const headersList = headers();
  const host = headersList.get('host')?.split(':')?.[0];

  if (host === 'myrubrics.com' || host === 'myrubrics-localhost.com') {
    return <HomePage />;
  }

  const programs = await fetchPrograms();
  const rubrics = await fetchRubrics();
  return (
    <div>
      <ProgramsGrid programs={programs} />
      <RubricsGrid rubrics={rubrics} />
    </div>
  );
}

export default Home;
