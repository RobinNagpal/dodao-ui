'use client';
import PageWrapper from '@/components/core/page/PageWrapper';
import Shorts from './Shorts';

import { useEffect, useState } from 'react';
const videos = [
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    link: '/video1',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    link: '/video1',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    link: '/video1',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    link: '/video1',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    link: '/video1',
  },
];

interface Props {
  image: string;
  title: string;
  topic: string;
  link: string;
  onClick?: () => void;
}

const ShortsThumbnail: React.FC<Props> = ({ image, title, topic, link, onClick }) => {
  return (
    <button onClick={onClick}>
      <a className="thumbnail-wrapper">
        <div className="image-wrapper">
          <img src={image} alt={title} className="thumbnail-image" />
        </div>
        <div className="title-wrapper">
          <h1>
            {' '}
            {title} | {topic}
          </h1>
        </div>
        <style jsx>{`
          .thumbnail-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            text-decoration: none;
            color: white;
          }
          .title-wrapper {
            margin-top: 10px;
            text-align: center;
            font-size: 18px;
          }
          .thumbnail-image {
            height: 30vh;
            width: 20vw;
            border-radius: 5%;
          }
        `}</style>
      </a>
    </button>
  );
};
interface ShortsUIProps {
  onThumbnailClick: (index: number) => void;
}

const ShortsUI: React.FC<ShortsUIProps> = ({ onThumbnailClick }) => {
  const [showComp, setShowComp] = useState(0);
  const [gridCols, setGridCols] = useState(1);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setGridCols(1);
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setGridCols(2);
      } else {
        setGridCols(4);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PageWrapper>
      <div className="grid">
        {videos.map((video, index) => (
          <ShortsThumbnail key={index} {...video} onClick={() => onThumbnailClick(index)} />
        ))}
        <style jsx>{`
          .grid {
            display: grid;
            grid-template-columns: repeat(${gridCols}, 1fr);
            gap: 50px;
          }
        `}</style>
      </div>
    </PageWrapper>
  );
};

export default ShortsUI;
