'use client';
import React from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
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

  const handleDetailsChange = (value: string) => {
    setNewProgram((prev) => ({ ...prev, details: value }));
  };

  const handleSummaryChange = (value: string) => {
    setNewProgram((prev) => ({ ...prev, summary: value }));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 w-full max-w-4xl">
        <Input
          modelValue={newProgram.name}
          onUpdate={(v) => handleInputChange('name', v?.toString() || '')}
          label="Program Name"
          required
          placeholder="Enter program name"
          className="mb-3 text-center"
        />
        <div className="w-full mb-3">
          <MarkdownEditor placeholder="Enter program details..." modelValue={newProgram.details} onUpdate={handleDetailsChange} label="Program Details" />
        </div>
        <div className="w-full mb-3">
          <MarkdownEditor placeholder="Enter program summary..." modelValue={newProgram.summary} onUpdate={handleSummaryChange} label="Program Summary" />
        </div>
      </div>
    </div>
  );
};

export default ProgramInput;
