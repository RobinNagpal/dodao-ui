import React from 'react';
import Card from '@dodao/web-core/components/core/card/Card';
import Link from 'next/link';
import { ProgramListProps } from '@/types/rubricsTypes/types';

const fetchPrograms = async (): Promise<ProgramListProps[]> => {
  try {
    const response = await fetch('/api/programs');
    const data = await response.json();
    return data.body;
  } catch (error) {
    throw new Error('Failed to fetch programs');
  }
};

const ProgramsList = async () => {
  const programs = await fetchPrograms();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Programs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {programs?.map((program: ProgramListProps) => (
          <Link key={program.id} href={`/program-details/${program.id}`} passHref>
            <Card className="cursor-pointer">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>
                  {program.name}
                </h2>
                <p>{program.details}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProgramsList;