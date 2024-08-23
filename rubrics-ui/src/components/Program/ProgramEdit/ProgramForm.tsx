'use client';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import React from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import { ProgramFormType } from '@/types/rubricsTypes/types';

const ProgramForm: React.FC<{
  newProgram: ProgramFormType;
  setNewProgram: React.Dispatch<React.SetStateAction<ProgramFormType>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ newProgram, setNewProgram, error, setError }) => {
  const handleInputChange = (field: keyof ProgramFormType, value: string | number) => {
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
    <div>
      <Input
        modelValue={newProgram.name}
        onUpdate={(v) => handleInputChange('name', v?.toString() || '')}
        label="Program Name"
        required
        placeholder="Enter program name"
        className="mb-3 text-left"
      />

      <MarkdownEditor placeholder="Enter program details..." modelValue={newProgram.details} onUpdate={handleDetailsChange} label="Program Details" />

      <MarkdownEditor placeholder="Enter program summary..." modelValue={newProgram.summary} onUpdate={handleSummaryChange} label="Program Summary" />
    </div>
  );
};

export default ProgramForm;
