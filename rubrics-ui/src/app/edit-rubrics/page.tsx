'use client';
import React, { useState, useEffect } from 'react';
import ProgramList from '@/components/programList/programList';
import RubricsPage from '@/components/rubricsTable/rubricsTable';
import ProgramDropDown from '@/components/programDropDown/programDropDown';
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
        <ProgramList />
        <ProgramDropDown onSelectProgram={handleSelectProgram} serverResponse={serverResponse} setServerResponse={setServerResponse} />
        <RubricsPage selectedProgramId={selectedProgramId} />
      </div>
    </div>
  );
}

export default EditRuberics;
