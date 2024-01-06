'use client';

import Grid5Cols from '@/components/core/grids/Grid5Cols';
import PageWrapper from '@/components/core/page/PageWrapper';
import { ProjectShortVideo, ShortVideo } from '@/graphql/generated/generated-types';
import styled from 'styled-components';
import Image from 'next/image';

const ImageWrapper = styled.div`
  width: 250px;
`;

function ShortsThumbnail({ shortVideo, onClick }: { shortVideo: ShortVideo | ProjectShortVideo; onClick: () => void }) {
  const { thumbnail, title } = shortVideo;
  return (
    <button onClick={onClick} className="p-2 min-w-0 flex">
      <ImageWrapper>
        <div>
          <Image alt={title} src={thumbnail} width={300} height={200} className="rounded-lg" placeholder="blur" blurDataURL={thumbnail} />
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
      <Grid5Cols>
        {shortVideos.map((video, index) => (
          <ShortsThumbnail key={index} shortVideo={video} onClick={() => onThumbnailClick(index)} />
        ))}
      </Grid5Cols>
    </PageWrapper>
  );
}
