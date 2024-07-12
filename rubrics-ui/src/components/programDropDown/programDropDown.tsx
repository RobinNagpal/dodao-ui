import React, { useEffect } from 'react';
import { ServerResponse, ProgramDropDownProps } from '@/types/rubricsTypes/types';
const ProgramDropDown: React.FC<ProgramDropDownProps> = ({ onSelectProgram, serverResponse, setServerResponse }) => {
  const { body: programs } = serverResponse;

  const handleProgramSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value;
    onSelectProgram(id);
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/ruberics/get-programs');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data: ServerResponse = await response.json();
        setServerResponse(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, [setServerResponse]);

  return (
    <div className="flex  align-center justify-center p-4">
      <select onChange={handleProgramSelect}>
        <option value="">Select a program</option>
        {programs.map((program) => (
          <option key={program.id} value={program.id}>
            {program.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProgramDropDown;
