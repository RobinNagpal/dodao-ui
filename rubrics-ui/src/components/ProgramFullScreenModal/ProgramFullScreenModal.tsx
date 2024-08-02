'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import EllipsisDropdown from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ProgramScreenModalProps {
  programName: string;
  programDetails: string;
  open?: boolean;
  onClose?: () => void;
}

const ProgramScreenModalClient: React.FC<ProgramScreenModalProps> = ({ programName, programDetails, open, onClose }) => {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(open ?? false);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleBack = () => {
    router.push('/programs');
  };

  const dropdownItems = [
    { label: 'Edit', key: 'edit' },
    { label: 'Action 2', key: 'action2' },
    { label: 'Action 3', key: 'action3' },
  ];

  const handleDropdownSelect = (key: string) => {
    console.log(`Selected: ${key}`);
  };

  return (
    <FullScreenModal open={isOpen} onClose={handleClose} title={programName} showCloseButton={false}>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Programs
          </button>
          <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />
        </div>
        <h1 className="text-4xl p-4">Program Details</h1>
        <p className="text-lg text-left leading-relaxed">{programDetails}</p>
      </div>
    </FullScreenModal>
  );
};

export default ProgramScreenModalClient;
