import ProgramEditScreen from '@/components/Program/ProgramEdit/ProgramEditScreen';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

const EditProgram = async ({ params }: { params: Promise<{ programId: string }> }) => {
  const { programId } = await params;
  const space = (await getSpaceServerSide())!;
  return (
    <PageWrapper>
      <Link href="/programs" className="flex">
        <ChevronLeftIcon className="h-5 w-5 mr-2" />
        Programs
      </Link>
      <ProgramEditScreen programId={programId} space={space} />
    </PageWrapper>
  );
};

export default EditProgram;
