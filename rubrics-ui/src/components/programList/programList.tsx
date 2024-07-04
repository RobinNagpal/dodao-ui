'use client';
import React from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import { ProgramListProps } from '../../types/rubricsTypes/types';
import { useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
const ProgramList: React.FC<ProgramListProps> = ({ programs }) => {
  const [newProgram, setNewProgram] = useState<{ name: string; details: string; rating: number }>({
    name: '',
    details: '',
    rating: 0,
  });

  const handleInputChange = (field: keyof typeof newProgram, value: string | number) => {
    setNewProgram((prevProgram) => ({
      ...prevProgram,
      [field]: value,
    }));
  };

  const handleCreateProgramClick = async () => {
    try {
      const response = await fetch('/api/ruberics/create-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProgram),
      });

      setNewProgram({ name: '', details: '', rating: 0 });
    } catch (error) {
      console.error('Error creating new program:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        modelValue={newProgram.rating}
        onUpdate={(v) => handleInputChange('rating', v ? Number(v) : 0)}
        label="Program Rating"
        placeholder="Enter program rating"
        number
        className="mb-3"
      />
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center mt-4">
        <Button onClick={handleCreateProgramClick} primary loading={false} disabled={false}>
          Create Program
        </Button>
      </div>
    </div>
  );
};

export default ProgramList;
