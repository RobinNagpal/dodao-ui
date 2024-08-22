'use client';

import React from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ProgramEditScreen from '@/components/Program/ProgramEdit/ProgramEditScreen';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import Button from '@dodao/web-core/components/core/buttons/Button';
interface EditProgramProps {
  programId: string;
  space: SpaceWithIntegrationsFragment;
}

const EditProgram: React.FC<EditProgramProps> = ({ programId, space }) => {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/programs/`);
  };

  return (
    <div>
      <Button onClick={handleBack}>
        <ChevronLeftIcon className="h-5 w-5 mr-2" />
        Programs
      </Button>
      <ProgramEditScreen programId={programId} space={space} />
    </div>
  );
};

export default EditProgram;
