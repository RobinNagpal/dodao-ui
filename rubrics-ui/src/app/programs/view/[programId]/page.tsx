import React from 'react';
import ProgramScreenModalClient from '@/components/ProgramFullScreenModal/ProgramFullScreenModal';

const Page = async ({ params }: { params: { programId: string } }) => {
  const { programId } = params;

  try {
    const response = await fetch(`http://localhost:3004/api/program?programId=${programId}`);

    const text = await response.text();

    const programData = JSON.parse(text);

    const programName = programData?.body?.name || 'Unknown Program Name';
    const programDetails = programData?.body?.details || 'No details available';

    return (
      <>
        <ProgramScreenModalClient programName={programName} programDetails={programDetails} open={true} />
      </>
    );
  } catch (error) {
    console.error('Error fetching API data:', error);

    return (
      <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
        </div>
        <p className="text-gray-700 text-base">Error fetching API data.</p>
      </div>
    );
  }
};

export default Page;
