import { fetchPrograms, ProgramsGrid } from '@/app/programs/ProgramsGrid';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

const ProgramsList = async () => {
  const space = (await getSpaceServerSide())!;
  const programs = await fetchPrograms();

  return <ProgramsGrid programs={programs} space={space} />;
};

export default ProgramsList;
