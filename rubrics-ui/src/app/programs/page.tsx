import { fetchPrograms, ProgramsGrid } from '@/app/programs/ProgramsGrid';
import React from 'react';

const ProgramsList = async () => {
  const programs = await fetchPrograms();

  return <ProgramsGrid programs={programs} />;
};

export default ProgramsList;
