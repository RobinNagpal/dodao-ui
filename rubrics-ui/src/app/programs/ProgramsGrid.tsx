import { Program } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import Card from '@dodao/web-core/components/core/card/Card';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import ProgramList from '@/app/programs/ProgramList';
export const fetchPrograms = async (): Promise<Program[]> => {
  const space = (await getSpaceServerSide())!;
  const spaceId = space.id;
  try {
    const response = await fetch(`${getBaseUrl()}/api/programs?spaceId=${spaceId}`);
    const data = await response.json();
    return data.body;
  } catch (error) {
    throw new Error('Failed to fetch programs');
  }
};

export function ProgramsGrid(props: { programs: Program[]; space: SpaceWithIntegrationsFragment }) {
  const { programs, space } = props;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Programs</h1>
      <ProgramList programs={programs} space={space} />
    </div>
  );
}