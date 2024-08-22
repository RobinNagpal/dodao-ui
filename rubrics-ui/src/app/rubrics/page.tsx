import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const RubricsList = async () => {
  const space = (await getSpaceServerSide())!;
  const rubrics = await fetchRubrics();

  return (
    <PageWrapper>
      <RubricsGrid rubrics={rubrics} space={space} />
    </PageWrapper>
  );
};

export default RubricsList;
