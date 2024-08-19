import { Rubric, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import Card from '@dodao/web-core/components/core/card/Card';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import React from 'react';
import RubricList from '@/app/rubrics/RubricsList';
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

export function RubricsGrid(props: { rubrics: Rubric[]; space: SpaceWithIntegrationsFragment }) {
  const { rubrics, space } = props;
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl text-center font-extrabold mb-10">Rubrics</h1>
      <RubricList rubrics={rubrics} space={space} />
    </div>
  );
}
