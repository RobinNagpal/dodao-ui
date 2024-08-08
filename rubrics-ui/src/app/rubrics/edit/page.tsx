'use client';
import React, { useState, useEffect } from 'react';
import RubricEdit from '@/components/EditRubric/EditRubric';
import RubricDetails from '@/components/RubricDetails/RubricDetails';
import ProgramInput from '@/components/ProgramInput/ProgramInput';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { SessionProps } from '@/types/rubricsTypes/types';

const Page = () => {
  const [rubricDetails, setRubricDetails] = useState<{
    name: string;
    summary: string;
    description: string;
  }>({
    name: '',
    summary: '',
    description: '',
  });

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
          <RubricEdit rubricDetails={rubricDetails} writeAccess={true} />
          <RubricDetails rubricDetails={rubricDetails} setRubricDetails={setRubricDetails} isEditAccess={true} />
        </div>
      ) : (
        <div>You are not allowed to edit rubrics.</div>
      )}
    </div>
  );
};

export default Page;
