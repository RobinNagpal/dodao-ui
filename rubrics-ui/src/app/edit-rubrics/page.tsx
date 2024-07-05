import React from 'react';
import ProgramList from '@/components/programList/programList';
import RubricsPage from '@/components/rubricsTable/rubricsTable';
async function EditRuberics() {
  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <ProgramList />
        <RubricsPage />
      </div>
    </div>
  );
}

export default EditRuberics;
