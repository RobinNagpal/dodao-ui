'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsView/RubricsPage';
import { RubricServerData } from '@/types/rubricsTypes/types';
import { RateRubricProps } from '@/types/rubricsTypes/types';
import { getSession } from 'next-auth/react';
import { SessionProps } from '@/types/rubricsTypes/types';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
const RateRubric: React.FC<RateRubricProps> = ({ params }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<RubricServerData>();
  const [session, setSession] = useState<SessionProps | null>(null);
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();
  const router = useRouter();
  const { id } = params;

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
    if (id) {
      const fetchProgramData = async () => {
        try {
          const response = await fetch(`http://localhost:3004/api/rubrics/${id}`);
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
  const handleBack = () => {
    router.push(`/rubrics/view/${id}`);
  };
  return (
    <div>
      {session && (
        <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
          <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
            <ChevronLeftIcon className="h-5 w-5 ml-4" />
            View Rubric
          </button>
          <RubricsPage
            selectedProgramId={selectedProgramId}
            isEditAccess={false}
            rateRubricsFormatted={serverResponse}
            writeAccess={true}
            isGlobalAccess={false}
          />
        </div>
      )}
    </div>
  );
};

export default RateRubric;
