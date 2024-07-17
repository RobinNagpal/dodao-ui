'use client';
import React, { useEffect, useState } from 'react';
import ProgramList from '@/components/ProgramInput/ProgramInput';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EditProgramRubricProps } from '@/types/rubricsTypes/types';

function EditProgram() {
  const [rubrics, setRubrics] = useState<EditProgramRubricProps[]>([]);
  const [showSelectRubricsModal, setShowSelectRubricsModal] = useState<boolean>(false);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [newProgram, setNewProgram] = useState<{ name: string; details: string; summary: string }>({
    name: '',
    details: '',
    summary: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(process.env.RUBRICS!)
      .then((res) => res.json())
      .then((data) => setRubrics(data.body))
      .catch((error) => console.error('Error fetching rubrics:', error));
  }, []);

  const handleRubricSelect = (rubricId: string) => {
    if (selectedRubrics.includes(rubricId)) {
      setSelectedRubrics(selectedRubrics.filter((id) => id !== rubricId));
    } else {
      setSelectedRubrics([...selectedRubrics, rubricId]);
    }
  };

  const sendSelectedRubrics = () => {
    const requestData = {
      ...newProgram,
      rubricIds: selectedRubrics,
    };

    fetch('http://localhost:3004/api/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => res.json())
      .then((data) => {
        setNewProgram({ name: '', details: '', summary: '' });
      })
      .catch((error) => console.error('Error sending data to backend:', error));
  };

  return (
    <div className="mt-10 p-2 flex flex-col items-center justify-center gap-6">
      <ProgramList newProgram={newProgram} setNewProgram={setNewProgram} error={error} setError={setError} />

      <Button variant="contained" primary onClick={() => setShowSelectRubricsModal(true)} className="mt-2">
        Select Rubrics
      </Button>

      <Button
        variant="contained"
        className="mt-2"
        primary
        disabled={!newProgram.name || !newProgram.details || !newProgram.summary}
        onClick={sendSelectedRubrics}
      >
        Create Program
      </Button>

      <FullPageModal open={showSelectRubricsModal} onClose={() => setShowSelectRubricsModal(false)} title="Select Rubrics">
        <div className="p-4 flex flex-wrap gap-4">
          {rubrics.map((rubric) => (
            <div
              key={rubric.id}
              className={`border border-gray-300 rounded-lg p-4 cursor-pointer ${selectedRubrics.includes(rubric.id) ? 'border-blue-500' : ''}`}
              onClick={() => handleRubricSelect(rubric.id)}
            >
              <h2 className="text-lg font-bold truncate">{rubric.name}</h2>
              <p className="text-sm text-gray-600 truncate">{rubric.summary}</p>
            </div>
          ))}
        </div>
        <Button variant="contained" primary onClick={() => setShowSelectRubricsModal(false)}>
          Done
        </Button>
      </FullPageModal>
    </div>
  );
}

export default EditProgram;
