'use client';

import PageWrapper from '@/components/core/page/PageWrapper';
import { ProjectShortVideo, ShortVideo } from '@/graphql/generated/generated-types';
import styled from 'styled-components';

const ImageWrapper = styled.div`
  width: 250px;
`;

function ShortsThumbnail({ shortVideo, onClick }: { shortVideo: ShortVideo | ProjectShortVideo; onClick: () => void }) {
  const { thumbnail, title } = shortVideo;
  return (
    <button onClick={onClick} className="p-2 min-w-0 flex">
      <ImageWrapper>
        <div>
          <img src={thumbnail} alt={title} className="rounded-lg" />
        </div>
        <div className="title-wrapper">
          <h1>{title}</h1>
        </div>
      </ImageWrapper>
    </button>
  );
}
interface ShortsUIProps {
  onThumbnailClick: (index: number) => void;
  shortVideos: (ShortVideo | ProjectShortVideo)[];
}

export default function Shorts({ shortVideos, onThumbnailClick }: ShortsUIProps) {
  return (
    <PageWrapper>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
        {shortVideos.map((video, index) => (
          <ShortsThumbnail key={index} shortVideo={video} onClick={() => onThumbnailClick(index)} />
        ))}
      </div>
    </PageWrapper>
  );
}
