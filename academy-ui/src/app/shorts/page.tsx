import Shorts from '@/components/shortVideos/View/Shorts';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shorts',
  description: 'Short Videos about Blockchain concepts',
  keywords: [],
};

const MainShortsComponent = async () => {
  const space = (await getSpaceServerSide())!;
  const response = await fetch(`${getBaseUrl()}/api/short-videos?spaceId=${space.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      tags: [TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString()],
    },
  });
  const videos = await response.json();
  return <Shorts shortVideos={videos.shortVideos} space={space} />;
};

export default MainShortsComponent;
