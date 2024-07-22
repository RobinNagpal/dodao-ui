'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/rubricsTable';
import { ProgramServerResponse } from '@/types/rubricsTypes/types';
import { RateRubricProps } from '@/types/rubricsTypes/types';

const RateRubric: React.FC<RateRubricProps> = ({ params }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<ProgramServerResponse>({ status: -1, body: [] });

  useEffect(() => {
    const { id } = params;

    if (id) {
      const fetchProgramData = async () => {
        try {
          const response = await fetch(`/api/rubrics?rubricId=${id}`);
          const data = await response.json();

          if (response.ok) {
            setServerResponse(data);
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
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <RubricsPage selectedProgramId={selectedProgramId} isEditAccess={false} />
      </div>
    </div>
  );
};

export default RateRubric;
