import React, { useEffect, useState } from 'react';
import { ProgramServerResponse, ProgramDropDownProps } from '@/types/rubricsTypes/types';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

const ProgramDropDown: React.FC<ProgramDropDownProps> = ({ onSelectProgram, serverResponse, setServerResponse }) => {
  const { body: programs } = serverResponse;
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/rubrics/get-programs');

      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data: ProgramServerResponse = await response.json();
      setServerResponse(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };
  useEffect(() => {
    fetchPrograms();
  }, [setServerResponse]);

  const handleProgramSelect = (id: string | null) => {
    setSelectedProgramId(id);
    if (id) {
      onSelectProgram(id);
    }
  };

  const programItems: StyledSelectItem[] = programs.map((program) => ({
    id: program.id.toString(),
    label: program.name,
  }));
  console.log(selectedProgramId);

  return (
    <div className="flex align-center justify-center p-4">
      <StyledSelect label="Select a program" items={programItems} selectedItemId={selectedProgramId} setSelectedItemId={handleProgramSelect} />
    </div>
  );
};

export default ProgramDropDown;
