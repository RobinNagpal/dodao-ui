import React from 'react';
import CreateRubric from '@/components/CreateRubric/CreateRubric';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const Page = async () => {
  const space = (await getSpaceServerSide())!;

  return (
    <div>
      <CreateRubric space={space} />
    </div>
  );
};

export default Page;
