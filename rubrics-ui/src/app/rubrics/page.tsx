import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import React from 'react';

const RubricsList = async () => {
  const rubrics = await fetchRubrics();
  return <RubricsGrid rubrics={rubrics} />;
};

export default RubricsList;
