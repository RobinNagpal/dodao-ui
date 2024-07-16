'use client';
import React from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import { ProgramForm } from '@/types/rubricsTypes/types';

const ProgramInput: React.FC<{
  newProgram: ProgramForm;
  setNewProgram: React.Dispatch<React.SetStateAction<ProgramForm>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ newProgram, setNewProgram, error, setError }) => {
  const handleInputChange = (field: keyof ProgramForm, value: string | number) => {
    setNewProgram((prevProgram) => ({
      ...prevProgram,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
        <Input
          modelValue={newProgram.name}
          onUpdate={(v) => handleInputChange('name', v?.toString() || '')}
          label="Program Name"
          required
          placeholder="Enter program name"
          className="mb-3"
        />
        <Input
          modelValue={newProgram.details}
          onUpdate={(v) => handleInputChange('details', v?.toString() || '')}
          label="Program Details"
          placeholder="Enter program details"
          className="mb-3"
        />
        <Input
          modelValue={newProgram.summary}
          onUpdate={(v) => handleInputChange('summary', v?.toString() || '')}
          label="Program summary"
          placeholder="Enter program summary"
          className="mb-3"
          required
        />
      </div>
    </div>
  );
};

export default ProgramInput;
