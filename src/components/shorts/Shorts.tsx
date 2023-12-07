'use client';
import { ImageType } from '@/components/shorts/ImageType';
import { videos } from '@/components/shorts/sampleVideos';
import PageWrapper from '@/components/core/page/PageWrapper';
import styled from 'styled-components';

const ImageWrapper = styled.div`
  width: 250px;
`;

function ShortsThumbnail({ image, title, topic, onClick }: ImageType) {
  return (
    <button onClick={onClick} className="p-2 min-w-0 flex">
      <ImageWrapper>
        <div>
          <img src={image} alt={title} className="rounded-lg" />
        </div>
        <div className="title-wrapper">
          <h1>
            {title} | {topic}
          </h1>
        </div>
      </ImageWrapper>
    </button>
  );
}
interface ShortsUIProps {
  onThumbnailClick: (index: number) => void;
}

const Shorts: React.FC<ShortsUIProps> = ({ onThumbnailClick }) => {
  return (
    <PageWrapper>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
        {videos.map((video, index) => (
          <ShortsThumbnail key={index} {...video} onClick={() => onThumbnailClick(index)} />
        ))}
      </div>
    </PageWrapper>
  );
};

export default Shorts;
