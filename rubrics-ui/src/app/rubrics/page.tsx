import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const RubricsList = async () => {
  const space = (await getSpaceServerSide())!;
  const rubrics = await fetchRubrics();

  return <RubricsGrid rubrics={rubrics} space={space} />;
};

export default RubricsList;
