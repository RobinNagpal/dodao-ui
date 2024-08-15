import { Rubric } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import Card from '@dodao/web-core/components/core/card/Card';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';

export const fetchRubrics = async (): Promise<Rubric[]> => {
  const space = (await getSpaceServerSide())!;

  try {
    const response = await fetch(`${getBaseUrl()}/api/rubrics?spaceId=${space.id}`);
    const data = await response.json();
    return data.body;
  } catch (error) {
    throw new Error('Failed to fetch rubrics');
  }
};

export function RubricsGrid(props: { rubrics: Rubric[] }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Rubrics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {props.rubrics.map((rubric) => (
          <Link href={`/rubrics/view/${rubric.id}`} key={rubric.id}>
            <Card className="cursor-pointer">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                  {rubric.name}
                </h2>
                <p>{rubric.summary}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
