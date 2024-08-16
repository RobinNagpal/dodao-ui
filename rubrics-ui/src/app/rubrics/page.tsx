import { fetchRubrics, RubricsGrid } from '@/app/rubrics/RubricsGrid';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
const RubricsList = async (props: { space: SpaceWithIntegrationsFragment }) => {
  const { space } = props;
  const rubrics = await fetchRubrics();

  return <RubricsGrid rubrics={rubrics} space={space} />;
};

export default RubricsList;
