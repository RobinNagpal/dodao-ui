import CreateRubricForm from '@/app/rubrics/edit/CreateRubricForm';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Program } from '@prisma/client';
import React from 'react';

const Page = async () => {
  const space = (await getSpaceServerSide())!;
  const programsResponse = await fetch(`${getBaseUrl()}/api/programs?spaceId=${space.id}`);
  const programs = (await programsResponse.json()) as Program[];
  return <CreateRubricForm space={space} programs={programs} />;
};

export default Page;
