import EditRubric from '@/components/EditRubric/EditRubric';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
const Page = async ({ params }: { params: { rubricId: string } }) => {
  const { rubricId } = params;
  const space = (await getSpaceServerSide())!;
  return (
    <div>
      <EditRubric rubricId={rubricId} space={space} />
    </div>
  );
};

export default Page;
