import RubricsPage from '@/components/RubricsView/RubricsPage';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

const Page = async ({ params }: { params: { rubricId: string } }) => {
  const space = (await getSpaceServerSide())!;
  const { rubricId } = params;

  const response = await fetch(`http://localhost:3004/api/rubrics/${rubricId}?spaceId=${space.id}`);
  const data = await response.json();
  const rubricData = data.body;

  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <Link href={'/rubrics'} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 ml-4" />
          Rubrics
        </Link>
        <RubricsPage isEditAccess={false} rateRubricsFormatted={rubricData} writeAccess={false} rubricName={rubricData?.name} isGlobalAccess={false} />
      </div>
    </div>
  );
};

export default Page;
