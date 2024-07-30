'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/rubricsTable';
import { RubricServerData } from '@/types/rubricsTypes/types';
import { RateRubricProps } from '@/types/rubricsTypes/types';
import { getSession } from 'next-auth/react';
import { SessionProps } from '@/types/rubricsTypes/types';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
const RateRubric: React.FC<RateRubricProps> = ({ params }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<RubricServerData>();
  const [session, setSession] = useState<SessionProps | null>(null);
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();
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
  useEffect(() => {
    const { id } = params;

    if (id) {
      const fetchProgramData = async () => {
        try {
          const response = await fetch(`http://localhost:3004/api/rubrics?rubricId=${id}`);
          const data = await response.json();

          if (response.ok) {
            setServerResponse(data.body);
          } else {
            console.error('Failed to fetch program data:', data.body);
          }
        } catch (error) {
          console.error('Failed to fetch program data:', error);
        }
      };

      fetchProgramData();
      setSelectedProgramId(id);
    }
  }, [params]);

  return (
    <div>
      {session && (
        <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
          <RubricsPage selectedProgramId={selectedProgramId} isEditAccess={false} rateRubricsFormatted={serverResponse} />
        </div>
      )}
    </div>
  );
};

export default RateRubric;
