import RubricsView from '@/components/RubricsView/RubricsView';
import { RubricWithEntities } from '@/types/rubricsTypes/types';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth';
const Page = async ({ params }: { params: { rubricId: string } }) => {
  const space = (await getSpaceServerSide())!;
  const { rubricId } = params;

  const response = await fetch(`${getBaseUrl()}/api/rubrics/${rubricId}?spaceId=${space.id}`);
  const rubric = (await response.json()) as RubricWithEntities;
  const session = (await getServerSession(authOptions)) as Session | undefined;

  const responseForRubricRating = await fetch(`${getBaseUrl()}/api/rubrics/${rubricId}/ratings?userId=${session?.userId}`);
  const data = await responseForRubricRating.json();
  const rubricRating = data.rubricRating;

  if (!response.ok) {
    throw new Error('Failed to fetch rubric');
  }
  return (
    <div>
      <div className="mt-10 p-2 flex-col items-center justify-center gap-x-6">
        <Link href={'/rubrics'} style={{ color: 'var(--primary-color)' }} className="flex items-center focus:outline-none">
          <ChevronLeftIcon className="h-5 w-5 ml-4" />
          Rubrics
        </Link>
        <RubricsView rubric={rubric} session={session} rubricRating={rubricRating} />
      </div>
    </div>
  );
};

export default Page;
