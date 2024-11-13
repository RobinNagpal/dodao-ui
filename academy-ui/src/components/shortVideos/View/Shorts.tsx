'use client';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ShortVideo } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import Grid5Cols from '@dodao/web-core/components/core/grids/Grid5Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import blurDataURL from './BlurDataUrl';
import styles from './Shorts.module.scss';

interface ShortsThumbnailProps {
  shortVideo: ShortVideo;
  space?: SpaceWithIntegrationsDto;
}

function ShortsThumbnail({ shortVideo, space }: ShortsThumbnailProps) {
  const { thumbnail, title } = shortVideo;
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();
  return (
    <div className="flex justify-between justify-items-end">
      <Link href={`/shorts/view/${shortVideo.id}`} className="p-2 min-w-0 flex flex-col">
        <div className="flex justify-between items-start">
          <div className={styles.imageWrapper + ' flex-grow'}>
            <div className={'relative ' + styles.innerDiv}>
              <Image
                alt={title}
                src={thumbnail}
                className="rounded-lg w-full h-full "
                placeholder="blur"
                blurDataURL={blurDataURL}
                fill={true}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 250px"
              />
            </div>
          </div>
        </div>
        <div className="title-wrapper mt-2">
          <h1>{title}</h1>
        </div>
      </Link>
      <div className="flex items-start">
        <PrivateEllipsisDropdown
          items={threeDotItems}
          className="z-150"
          onSelect={(key) => {
            if (key === 'delete') {
              setShowDeleteModal(true);
            }
          }}
        />
      </div>
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Delete Short Video - ${shortVideo.title}`}
          deleteButtonText="Delete Short Video"
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            await fetch(`/api/short-videos/${shortVideo.id}`, {
              method: 'DELETE',
              body: JSON.stringify({ spaceId: space!.id }),
            });
            setShowDeleteModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
interface ShortsUIProps {
  shortVideos: ShortVideo[];
  space?: SpaceWithIntegrationsDto;
}

export default function Shorts({ shortVideos, space }: ShortsUIProps) {
  return (
    <PageWrapper>
      <Grid5Cols>{shortVideos.map((video, index) => !video.archive && <ShortsThumbnail key={index} shortVideo={video} space={space} />)}</Grid5Cols>
    </PageWrapper>
  );
}
