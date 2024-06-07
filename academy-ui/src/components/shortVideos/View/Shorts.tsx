import Grid5Cols from '@dodao/web-core/components/core/grids/Grid5Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ProjectShortVideo, ShortVideo } from '@/graphql/generated/generated-types';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Shorts.module.scss';
import blurDataURL from './BlurDataUrl';

function ShortsThumbnail({ shortVideo }: { shortVideo: ShortVideo | ProjectShortVideo }) {
  const { thumbnail, title } = shortVideo;
  return (
    <Link href={`/shorts/view/${shortVideo.id}`} className="p-2 min-w-0 flex">
      <div className={styles.imageWrapper}>
        <div className={'relative ' + styles.innerDiv}>
          <Image
            alt={title}
            src={thumbnail}
            className="rounded-lg absolute top-0 left-0 w-full h-full"
            placeholder="blur"
            blurDataURL={blurDataURL}
            fill={true}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 250px"
          />
        </div>
        <div className="title-wrapper">
          <h1>{title}</h1>
        </div>
      </div>
    </Link>
  );
}
interface ShortsUIProps {
  shortVideos: (ShortVideo | ProjectShortVideo)[];
}

export default function Shorts({ shortVideos }: ShortsUIProps) {
  return (
    <PageWrapper>
      <Grid5Cols>
        {shortVideos.map((video, index) => (
          <ShortsThumbnail key={index} shortVideo={video} />
        ))}
      </Grid5Cols>
    </PageWrapper>
  );
}
