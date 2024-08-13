import EditRubric from '@/components/EditRubric/EditRubric';
import React from 'react';

const Page = ({ params }: { params: { rubricId: string } }) => {
  const { rubricId } = params;
  return (
    <div>
      <EditRubric rubricId={rubricId} />
    </div>
  );
};

export default Page;
