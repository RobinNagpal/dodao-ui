import EditRubric from '@/components/Rubric/RubricEdit/EditRubric';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Program } from '@prisma/client';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const Page = async ({ params }: { params: { rubricId: string } }) => {
  const { rubricId } = params;
  const space = (await getSpaceServerSide())!;
  const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubricId}?spaceId=${space.id}`);
  const rubric = (await response.json()) as RubricWithEntities;

  const programsResponse = await fetch(`${getBaseUrl()}/api/programs?spaceId=${space.id}`);
  const programs = (await programsResponse.json()) as Program[];
  return (
    <PageWrapper>
      <EditRubric space={space} rubric={rubric} programs={programs} />
    </PageWrapper>
  );
};

export default Page;
