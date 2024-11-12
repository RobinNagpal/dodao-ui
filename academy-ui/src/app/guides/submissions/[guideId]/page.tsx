import GuideSubmissionsTable from '@/components/guides/Submissions/GuideSubmissionsTable';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import React from 'react';

async function GuideSubmissionsPage({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  const space = (await getSpaceServerSide())!;
  return (
    <PageWrapper>
      <div tw="px-4 md:px-0 overflow-hidden">
        <Link href={`/guides/view/${guideId}/0`} className="text-color">
          <span className="mr-1 font-bold">&#8592;</span>
          Back to Guide
        </Link>
      </div>
      <div className="mt-4">
        <GuideSubmissionsTable space={space} guideId={guideId} />
      </div>
    </PageWrapper>
  );
}

export default GuideSubmissionsPage;
