'use client';

import ProgramForm from '@/components/Program/ProgramEdit/ProgramForm';
import SelectRubricModal, { RubricSummary } from '@/components/Program/ProgramEdit/SelectRubricModal';
import { SpaceWithIntegrationsFragment } from '@/types/rubricsTypes/types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useEffect, useState } from 'react';

interface EditProgramProps {
  programId?: string;
  space: SpaceWithIntegrationsFragment;
}

function EditProgram({ programId, space }: EditProgramProps) {
  const [rubrics, setRubrics] = useState<RubricSummary[]>([]);
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
    fetch(`${getBaseUrl()}/api/rubrics-program?spaceId=${space.id}`)
      .then((res) => res.json())
      .then((data) => setRubrics(data.body))
      .catch((error) => console.error('Error fetching rubrics:', error));
  }, []);

  useEffect(() => {
    if (programId) {
      fetch(`${getBaseUrl()}/api/program?programId=${programId}`)
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
      spaceId: space.id,
    };

    const url = programId ? `${getBaseUrl()}/api/program/${programId}` : `${getBaseUrl()}/api/programs`;

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
    <div>
      <ProgramForm newProgram={newProgram} setNewProgram={setNewProgram} error={error} setError={setError} />

      <Button variant="contained" primary onClick={() => setShowSelectRubricsModal(true)} className="mt-2">
        Select Rubrics
      </Button>

      <Button
        variant="contained"
        className="mt-2 ml-2"
        primary
        disabled={!newProgram.name || !newProgram.details || !newProgram.summary}
        onClick={handleSaveProgram}
      >
        {programId ? 'Update Program' : 'Create Program'}
      </Button>

      <SelectRubricModal
        open={showSelectRubricsModal}
        onClose={() => setShowSelectRubricsModal(false)}
        selectedRubricIds={selectedRubrics}
        rubrics={rubrics}
        handleRubricSelect={handleRubricSelect}
      />
    </div>
  );
}

export default EditProgram;
