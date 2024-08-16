import { fetchPrograms, ProgramsGrid } from '@/app/programs/ProgramsGrid';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
const ProgramsList = async (props: { space: SpaceWithIntegrationsFragment }) => {
  const { space } = props;
  const programs = await fetchPrograms();

  return <ProgramsGrid programs={programs} space={space} />;
};

export default ProgramsList;
