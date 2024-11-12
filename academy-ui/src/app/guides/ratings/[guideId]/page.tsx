import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import React from 'react';
import ViewGuideRatings from './ViewGuideRatings';

async function ViewGuideRatingsPage({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  const space = (await getSpaceServerSide())!;
  return <ViewGuideRatings guideId={guideId} space={space} />;
}

export default ViewGuideRatingsPage;
