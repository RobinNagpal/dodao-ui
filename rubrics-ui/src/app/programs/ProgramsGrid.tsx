import { Program } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import Card from '@dodao/web-core/components/core/card/Card';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';

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

export function ProgramsGrid(props: { programs: Program[] }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Programs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {props.programs.map((program) => (
          <Link key={program.id} href={`/programs/view/${program.id}`} passHref>
            <Card className="cursor-pointer">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>
                  {program.name}
                </h2>
                <p>{program.summary}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
