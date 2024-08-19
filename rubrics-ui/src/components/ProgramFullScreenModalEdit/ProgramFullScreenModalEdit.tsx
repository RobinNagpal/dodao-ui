'use client';

import React from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ProgramEditScreen from '@/components/ProgramEditScreen/ProgramEditScreen';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
interface EditProgramProps {
  programId: string;
  space: SpaceWithIntegrationsFragment;
}

const EditProgram: React.FC<EditProgramProps> = ({ programId, space }) => {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/programs/`);
  };
  const handleClose = () => {};
  return (
    <FullScreenModal open={true} onClose={handleClose} title="Edit Program" showCloseButton={false}>
      <div className="p-10 max-w-4xl mx-auto  rounded-lg shadow-lg">
        <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Programs
        </button>
        <ProgramEditScreen programId={programId} space={space} />
      </div>
    </FullScreenModal>
  );
};

export default EditProgram;
