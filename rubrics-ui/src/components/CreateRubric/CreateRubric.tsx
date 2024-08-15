'use client';
import React, { useState, useEffect } from 'react';
import RubricDetails from '@/components/RubricDetails/RubricDetails';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { ProgramServerResponse, SessionProps, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
interface CreateRubricProps {
  space: SpaceWithIntegrationsFragment;
}
const CreateRubric: React.FC<CreateRubricProps> = ({ space }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [rubricDetails, setRubricDetails] = useState<{
    name: string;
    summary: string;
    description: string;
  }>({
    name: '',
    summary: '',
    description: '',
  });
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

  if (showLoginModal) {
    return <div>Please log in to view and edit rubrics.</div>;
  }

  if (!session) {
    return <div className="text-center">Loading session data...</div>;
  }

  return (
    <div>
      {session.isAdminOfSpace ? (
        <div>
          <RubricDetails
            rubricDetails={rubricDetails}
            setRubricDetails={setRubricDetails}
            isEditAccess={true}
            programs={serverResponse}
            setPrograms={setServerResponse}
            onSelectProgram={handleSelectProgram}
            selectedProgramId={selectedProgramId}
            isGlobalAccess={true}
            space={space}
          />
        </div>
      ) : (
        <div>You are not allowed to edit rubrics.</div>
      )}
    </div>
  );
};

export default CreateRubric;
