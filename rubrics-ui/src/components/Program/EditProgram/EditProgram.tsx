'use client';
import React, { useEffect, useState } from 'react';
import ProgramEdit from '@/components/Program/EditProgram/ProgramEditScreen';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { SessionProps, SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';

interface EditUIProps {
  space: SpaceWithIntegrationsFragment;
}

function EditProgram({ space }: EditUIProps) {
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
          <ProgramEdit space={space} />
        ) : (
          <div>You are not allowed to edit programs.</div>
        )
      ) : (
        showLoginModal && <div>Please log in to edit programs.</div>
      )}
    </div>
  );
}

export default EditProgram;
