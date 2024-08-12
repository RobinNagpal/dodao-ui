'use client';

import React from 'react';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ProgramEditScreen from '@/components/ProgramEditScreen/ProgramEditScreen';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
interface EditProgramProps {
  programId: string;
}

const EditProgram: React.FC<EditProgramProps> = ({ programId }) => {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/programs/view/${programId}`);
  };
  const handleClose = () => {};
  return (
    <FullScreenModal open={true} onClose={handleClose} title="Edit Program" showCloseButton={false}>
      <div className="p-10 max-w-4xl mx-auto  rounded-lg shadow-lg">
        <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          View Program
        </button>
        <ProgramEditScreen programId={programId} />
      </div>
    </FullScreenModal>
  );
};

export default EditProgram;
