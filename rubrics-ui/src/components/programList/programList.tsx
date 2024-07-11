'use client';
import React, { useState } from 'react';
import Input from '@dodao/web-core/components/core/input/Input';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { ProgramListProps } from '@/types/rubricsTypes/types';
import { useRouter } from 'next/navigation';
const ProgramList: React.FC<ProgramListProps> = () => {
  const [newProgram, setNewProgram] = useState<{ name: string; details: string }>({
    name: '',
    details: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const handleInputChange = (field: keyof typeof newProgram, value: string | number) => {
    setNewProgram((prevProgram) => ({
      ...prevProgram,
      [field]: value,
    }));
  };

  const handleCreateProgramClick = async () => {
    if (!newProgram.name || !newProgram.details) {
      setError('Please fill in all fields with valid values.');
      return;
    }

    setError(null);

    try {
      const response = await fetch('http://localhost:3004/api/ruberics/create-programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProgram),
      });

      setNewProgram({ name: '', details: '' });
    } catch (error) {
      console.error('Error creating new program:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

        <Button className="lg:mt-10" onClick={handleCreateProgramClick} primary loading={false} disabled={false}>
          Create
        </Button>

        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default ProgramList;
