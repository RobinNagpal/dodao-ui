'use client';

import React, { useEffect, useState } from 'react';
import ProgramInput from '@/components/ProgramInput/ProgramInput';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EditProgramRubricProps } from '@/types/rubricsTypes/types';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface EditProgramProps {
  programId?: string;
}

function EditProgram({ programId }: EditProgramProps) {
  const [rubrics, setRubrics] = useState<EditProgramRubricProps[]>([]);
  const [showSelectRubricsModal, setShowSelectRubricsModal] = useState<boolean>(false);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [newProgram, setNewProgram] = useState<{ name: string; details: string; summary: string }>({
    name: '',
    details: '',
    summary: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotificationContext();

  useEffect(() => {
    // Fetch rubrics to create mapping
    fetch('http://localhost:3004/api/rubrics-program')
      .then((res) => res.json())
      .then((data) => setRubrics(data.body))
      .catch((error) => console.error('Error fetching rubrics:', error));
  }, []);

  useEffect(() => {
    if (programId) {
      fetch(`http://localhost:3004/api/program?programId=${programId}`)
        .then((res) => res.json())
        .then((data) => {
          const { name, details, summary, rubricIds } = data.body;
          setNewProgram({ name, details, summary });
          setSelectedRubrics(rubricIds || []);
        })
        .catch((error) => console.error('Error fetching program details:', error));
    }
  }, [programId]);

  const handleRubricSelect = (rubricId: string) => {
    if (selectedRubrics.includes(rubricId)) {
      setSelectedRubrics(selectedRubrics.filter((id) => id !== rubricId));
    } else {
      setSelectedRubrics([...selectedRubrics, rubricId]);
    }
  };

  const handleSaveProgram = () => {
    const requestData = {
      ...newProgram,
      rubricIds: selectedRubrics,
    };

    const url = programId ? `http://localhost:3004/api/program/${programId}` : 'http://localhost:3004/api/programs';

    const method = programId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => res.json())
      .then((data) => {
        showNotification({
          message: programId ? 'Program updated successfully!' : 'Program created successfully!',
          type: 'success',
        });
      })
      .catch((error) => {
        console.error('Error sending data to backend:', error);

        showNotification({
          message: 'Failed to save program. Please try again.',
          type: 'error',
        });
      });
  };

  return (
    <div className="mt-10 p-2 flex flex-col items-center justify-center gap-6">
      <ProgramInput newProgram={newProgram} setNewProgram={setNewProgram} error={error} setError={setError} />

      <Button variant="contained" primary onClick={() => setShowSelectRubricsModal(true)} className="mt-2">
        Select Rubrics
      </Button>

      <Button
        variant="contained"
        className="mt-2"
        primary
        disabled={!newProgram.name || !newProgram.details || !newProgram.summary}
        onClick={handleSaveProgram}
      >
        {programId ? 'Update Program' : 'Create Program'}
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
