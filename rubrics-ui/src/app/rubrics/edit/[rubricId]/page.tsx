'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/rubricsTable';
import { EditRubricCell, SampleData } from '@/types/rubricsTypes/types';
import RubricDetails from '@/components/RubricDetails/RubricDetails';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { SessionProps } from '@/types/rubricsTypes/types';
const Page = ({ params }: { params: { rubricId: string } }) => {
  const { rubricId } = params;

  const [serverResponse, setServerResponse] = useState<SampleData | null>(null);
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
  const fetchProgramData = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/rubrics?rubricId=${rubricId}`);
      const data = await response.json();
      console.log(data.body);

      if (response.ok) {
        setServerResponse(data.body);
      } else {
        console.error('Failed to fetch program data:', data.body);
      }
    } catch (error) {
      console.error('Failed to fetch program data:', error);
    }
  };

  useEffect(() => {
    if (rubricId) {
      fetchProgramData();
    }
  }, [rubricId]);

  useEffect(() => {
    if (serverResponse) {
      setRubricDetails({
        name: serverResponse.name,
        summary: serverResponse.summary || '',
        description: serverResponse.details || '',
      });
    }
  }, [serverResponse]);

  const editRubrics: Record<string, string[]> = serverResponse
    ? Object.keys(serverResponse.rubric).reduce((acc, criterion) => {
        const cells = serverResponse.rubric[criterion] as EditRubricCell[];
        acc[criterion] = cells.map((cell) => cell.description);
        return acc;
      }, {} as Record<string, string[]>)
    : {};

  const criteriaOrder: string[] = serverResponse ? serverResponse.criteriaOrder : [];
  const ratingHeaders: string[] = serverResponse ? serverResponse.ratingHeaders.map((header) => header.header) : [];
  const columnScores = serverResponse ? serverResponse.ratingHeaders.map((header) => header.score) : [];
  const editCriteriaIds = serverResponse?.criteriaIds;
  console.log(serverResponse);

  if (!serverResponse) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      {session ? (
        session.isAdminOfSpace ? (
          <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
            <RubricDetails editRubricDetails={rubricDetails} rubricDetails={rubricDetails} setRubricDetails={setRubricDetails} isEditAccess={true} />
            <RubricsPage
              isEditAccess={true}
              writeAccess={true}
              rubricName={serverResponse.name}
              rubricId={rubricId}
              isGlobalAccess={true}
              editRubrics={editRubrics}
              editCriteriaOrder={criteriaOrder}
              editRatingHeaders={ratingHeaders}
              editColumnScores={columnScores}
              rubricDetails={rubricDetails}
              editCriteriaIds={editCriteriaIds}
            />
          </div>
        ) : (
          <div>You are not allowed to edit rubrics.</div>
        )
      ) : (
        showLoginModal && <div>Please log in to view and edit rubrics.</div>
      )}
    </div>
  );
};

export default Page;
