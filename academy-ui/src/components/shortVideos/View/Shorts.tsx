'use client';
import Grid5Cols from '@dodao/web-core/components/core/grids/Grid5Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ProjectShortVideo, ShortVideo } from '@/graphql/generated/generated-types';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Shorts.module.scss';
import blurDataURL from './BlurDataUrl';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useState } from 'react';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
function ShortsThumbnail({ shortVideo }: { shortVideo: ShortVideo | ProjectShortVideo }) {
  const { thumbnail, title } = shortVideo;
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="flex-row justify-between items-start relative ">
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Short Video'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            // await deleteByteMutation({ variables: { spaceId: space.id, byteId: byteId! } });
            setShowDeleteModal(false);
            // router.push(`/tidbits`);
          }}
        />
      )}
      <Link href={`/shorts/view/${shortVideo.id}`} className="p-2 min-w-0 flex">
        <div className={styles.imageWrapper}>
          <div className={'relative ' + styles.innerDiv}>
            <div className="absolute top-0 right-0 z-150 ">
              <PrivateEllipsisDropdown
                items={threeDotItems}
                className="z-150 "
                onSelect={(key) => {
                  if (key === 'delete') {
                    setShowDeleteModal(true);
                  }
                }}
              />
            </div>
            <Image
              alt={title}
              src={thumbnail}
              className="rounded-lg absolute top-0 left-0 w-full h-full "
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
    </div>
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
