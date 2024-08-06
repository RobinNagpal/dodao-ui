import React from 'react';
import RubricView from '@/components/RubricView/RubricView';
const page = ({ params }: { params: { rubricId: string } }) => {
  const { rubricId } = params;
  return (
    <div>
      <RubricView rubricId={rubricId} />
    </div>
  );
};

export default page;
