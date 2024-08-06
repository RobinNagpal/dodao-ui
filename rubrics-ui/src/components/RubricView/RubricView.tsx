'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/rubricsTable';
import { RubricServerData } from '@/types/rubricsTypes/types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ViewRubricProps {
  rubricId: string;
}

const ViewRubric: React.FC<ViewRubricProps> = ({ rubricId }) => {
  const [serverResponse, setServerResponse] = useState<RubricServerData>();
  const router = useRouter();

  useEffect(() => {
    if (rubricId) {
      const fetchProgramData = async () => {
        try {
          const response = await fetch(`http://localhost:3004/api/rubrics?rubricId=${rubricId}`);
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
    }
  }, [rubricId]);

  const handleBack = () => {
    router.push(`/rubrics`);
  };
  const handleDropdownSelect = (key: string) => {
    if (key === 'rate') {
      router.push(`/rate-rubric/${rubricId}`);
    }
  };
  return (
    <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
      <button onClick={handleBack} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
        <ChevronLeftIcon className="h-5 w-5 ml-4" />
        Rubrics
      </button>
      <RubricsPage
        isEditAccess={false}
        rateRubricsFormatted={serverResponse}
        writeAccess={false}
        rubricName={serverResponse?.name}
        handleDropdownSelect={handleDropdownSelect}
      />
    </div>
  );
};

export default ViewRubric;
