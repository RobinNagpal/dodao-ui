import RubricsView from '@/components/RubricsView/RubricsView';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

const Page = async ({ params }: { params: { rubricId: string } }) => {
  const space = (await getSpaceServerSide())!;
  const { rubricId } = params;

  const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubricId}?spaceId=${space.id}`);
  const rubric = (await response.json()) as RubricWithEntities;
  const session = (await getSession()) as Session | undefined;

  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <Link href={'/rubrics'} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 ml-4" />
          Rubrics
        </Link>
        <RubricsView rubric={rubric} session={session} />
      </div>
    </div>
  );
};

export default Page;
