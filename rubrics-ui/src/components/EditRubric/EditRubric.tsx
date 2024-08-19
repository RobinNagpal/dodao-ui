'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsView/RubricsPage';
import { EditRubricCell, SampleData } from '@/types/rubricsTypes/types';
import RubricDetails from '@/components/RubricsView/RubricDetails';
import { getSession } from 'next-auth/react';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { SessionProps, EditRubricProps } from '@/types/rubricsTypes/types';

const EditRubric: React.FC<EditRubricProps> = ({ rubricId, space }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
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
      const response = await fetch(`http://localhost:3004/api/rubrics/${rubricId}`);
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

  // const criteriaOrder: string[] = serverResponse ? serverResponse.criteriaOrder : [];
  const ratingHeaders: { id: string; header: string; score: number }[] = serverResponse
    ? serverResponse.ratingHeaders.map((header) => ({
        id: header.id,
        header: header.header,
        score: header.score,
      }))
    : [];
  const columnScores = serverResponse ? serverResponse.ratingHeaders.map((header) => header.score) : [];
  const editCriteriaOrder = serverResponse?.criteriaIds;

  if (!serverResponse) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }
  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
  };
  const rubricCellIds = serverResponse.rubric;

  return (
    <div>
      {session ? (
        session.isAdminOfSpace ? (
          <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
            <RubricDetails
              isGlobalAccess={false}
              editRubricDetails={rubricDetails}
              rubricDetails={rubricDetails}
              setRubricDetails={setRubricDetails}
              isEditAccess={true}
              rubricId={rubricId}
              space={space}
            />
            <RubricsPage
              isEditAccess={true}
              writeAccess={true}
              rubricName={serverResponse.name}
              rubricId={rubricId}
              isGlobalAccess={true}
              editRubrics={editRubrics}
              editCriteriaOrder={editCriteriaOrder}
              editRatingHeaders={ratingHeaders}
              editColumnScores={columnScores}
              rubricDetails={rubricDetails}
              editCriteriaIds={editCriteriaOrder}
              selectedProgramId={selectedProgramId}
              rubricCellIds={rubricCellIds}
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

export default EditRubric;
