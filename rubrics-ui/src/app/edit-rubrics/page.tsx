'use client';
import React, { useState, useEffect } from 'react';
import RubricsTable from '@/components/RubricsTable/rubricsTable';
import { ProgramServerResponse } from '@/types/rubricsTypes/types';
import ProgramDropDown from '@/components/ProgramDropDown/ProgramDropDown';
function EditRuberics() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<ProgramServerResponse>({ status: -1, body: [] });

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
  };

  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <ProgramDropDown serverResponse={serverResponse} setServerResponse={setServerResponse} onSelectProgram={handleSelectProgram} />
        <RubricsTable selectedProgramId={selectedProgramId} />
      </div>
    </div>
  );
}

export default EditRuberics;
