'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import EllipsisDropdown from '@dodao/web-core/src/components/core/dropdowns/EllipsisDropdown';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import { SessionProps } from '@/types/rubricsTypes/types';

interface ProgramScreenModalProps {
  programName: string;
  programDetails?: string;
  programId?: string;
  open?: boolean;
  onClose?: () => void;
}

const ProgramScreenModalClient: React.FC<ProgramScreenModalProps> = ({ programName, programDetails, programId, open, onClose }) => {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [session, setSession] = useState<SessionProps | null>(null);
  const router = useRouter();

  const isUserLoggedIn = async () => {
    const session = await getSession();
    setSession(session as SessionProps | null);
  };

  useEffect(() => {
    isUserLoggedIn();
  }, []);

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

  const dropdownItems = [{ label: 'Edit', key: 'edit' }];

  const handleDropdownSelect = (key: string) => {
    if (key === 'edit' && programId) {
      router.push(`/programs/edit/${programId}`);
    }
  };

  return (
    <FullScreenModal open={isOpen} onClose={handleClose} title={programName} showCloseButton={false}>
      <div className="p-10 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Programs
          </button>
          {session?.isAdminOfSpace && <EllipsisDropdown items={dropdownItems} onSelect={handleDropdownSelect} />}
        </div>
        <h1 className="text-4xl p-4 text-left">Program Details</h1>
        <p className="text-md p-2 text-left leading-relaxed">{programDetails}</p>
      </div>
    </FullScreenModal>
  );
};

export default ProgramScreenModalClient;
