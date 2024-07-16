'use client';
import React, { useState, useEffect } from 'react';
import RubricsPage from '@/components/RubricsTable/RubricsTable';
import { ServerResponse } from '@/types/rubricsTypes/types';

function EditRuberics() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<ServerResponse>({ status: -1, body: [] });

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
  };

  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <RubricsPage selectedProgramId={selectedProgramId} isEditAccess={true} />
      </div>
    </div>
  );
}

export default EditRuberics;
