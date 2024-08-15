import React from 'react';
import RubricView from '@/components/RubricView/RubricView';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const Page = async ({ params }: { params: { rubricId: string } }) => {
  const space = (await getSpaceServerSide())!;
  const { rubricId } = params;
  return (
    <div>
      <RubricView rubricId={rubricId} space={space} />
    </div>
  );
};

export default Page;
