import React from 'react';
import Link from 'next/link';
import Card from '@dodao/web-core/components/core/card/Card';
import { RubricListProps } from '@/types/rubricsTypes/types';

const fetchRubrics = async (): Promise<RubricListProps[]> => {
  try {
    const response = await fetch('/api/rubrics-program');
    const data = await response.json();
    return data.body;
  } catch (error) {
    throw new Error('Failed to fetch rubrics');
  }
};

const RubricsList = async () => {
  const rubrics = await fetchRubrics();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Rubrics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rubrics.map((rubric: RubricListProps) => (
          <Link href={`/rate-rubric/${rubric.id}`} key={rubric.id}>
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
};

export default RubricsList;
