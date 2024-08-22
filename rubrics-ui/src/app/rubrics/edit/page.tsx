import CreateRubricForm from '@/app/rubrics/edit/CreateRubricForm';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Program } from '@prisma/client';
import React from 'react';

const Page = async () => {
  const space = (await getSpaceServerSide())!;
  const programsResponse = await fetch(`${getBaseUrl()}/api/programs?spaceId=${space.id}`);
  const programs = (await programsResponse.json()) as Program[];
  return (
    <PageWrapper>
      <CreateRubricForm space={space} programs={programs} />
    </PageWrapper>
  );
};

export default Page;
