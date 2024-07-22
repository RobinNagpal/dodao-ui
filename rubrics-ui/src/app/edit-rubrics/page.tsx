'use client';
import React, { useState, useEffect } from 'react';
import RubricsTable from '@/components/RubricsTable/rubricsTable';
import { ProgramServerResponse } from '@/types/rubricsTypes/types';
import ProgramDropDown from '@/components/ProgramDropDown/programDropDown';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { SessionProps } from '@/types/rubricsTypes/types';

function EditRubrics() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<ProgramServerResponse>({ status: -1, body: [] });
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();
  const [session, setSession] = useState<SessionProps | null>(null);

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
  };

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
  console.log(session);

  return (
    <div>
      {session ? (
        <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
          <ProgramDropDown serverResponse={serverResponse} setServerResponse={setServerResponse} onSelectProgram={handleSelectProgram} />
          <RubricsTable selectedProgramId={selectedProgramId} />
        </div>
      ) : (
        showLoginModal && <div>Please log in to view and edit rubrics.</div>
      )}
    </div>
  );
}

export default EditRubrics;
