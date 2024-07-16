// Import necessary modules and types
'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/RubricsTable';
import { ServerResponse } from '@/types/rubricsTypes/types';

// Define props interface for RateProgram component
interface RateProgramProps {
  params: {
    id: string;
  };
}

const RateProgram: React.FC<RateProgramProps> = ({ params }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<ServerResponse>({ status: -1, body: [] });

  useEffect(() => {
    const { id } = params;

    if (id) {
      const fetchProgramData = async () => {
        try {
          const response = await fetch(`http://localhost:3004/api/ruberics/get-rubric?programId=${id}`);
          const data = await response.json();
          console.log(data);

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

export default RateProgram;
