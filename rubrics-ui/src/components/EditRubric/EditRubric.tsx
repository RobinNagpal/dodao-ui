'use client';
import React, { useState, useEffect } from 'react';
import RubricsTable from '@/components/RubricsTable/rubricsTable';
import ProgramDropDown from '@/components/ProgramDropDown/programDropDown';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { ProgramServerResponse, SessionProps, EditRubricsProps } from '@/types/rubricsTypes/types';

function EditRubrics({ rubricDetails, writeAccess, selectedProgramId }: EditRubricsProps) {
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();
  const [session, setSession] = useState<SessionProps | null>(null);
  const isUserLoggedIn = async () => {
    const session = await getSession();
    setSession(session as SessionProps | null);
    if (!session) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  };

  useEffect(() => {
    isUserLoggedIn();
  }, [showLoginModal]);

  return (
    <div>
      {session ? (
        session.isAdminOfSpace ? (
          <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
            <RubricsTable selectedProgramId={selectedProgramId} isEditAccess={true} rubricDetails={rubricDetails} writeAccess={writeAccess} />
          </div>
        ) : (
          <div>You are not allowed to edit rubrics.</div>
        )
      ) : (
        showLoginModal && <div>Please log in to view and edit rubrics.</div>
      )}
    </div>
  );
}

export default EditRubrics;
