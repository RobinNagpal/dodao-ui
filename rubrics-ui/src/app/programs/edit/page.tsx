import ProgramEditScreen from '@/components/Program/ProgramEdit/ProgramEditScreen';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React from 'react';

async function EditProgram() {
  const space = (await getSpaceServerSide())!;

  return (
    <PageWrapper>
      <ProgramEditScreen space={space} />
    </PageWrapper>
  );
}

export default EditProgram;
