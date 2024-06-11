import Shorts from '@/components/shortVideos/View/Shorts';
import { ProjectShortVideo, ShortVideo, ShortVideoFragment } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { getSpaceServerSide } from '@dodao/web-core/api/auth/getSpaceServerSide';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shorts',
  description: 'Short Videos about Blockchain concepts',
  keywords: [],
};

const MainShortsComponent = async () => {
  const space = (await getSpaceServerSide())!;
  const videos = await getApiResponse<ShortVideo[] | ProjectShortVideo[]>(space, 'short-videos');
  return <Shorts shortVideos={videos} />;
};

export default MainShortsComponent;
