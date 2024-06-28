'use client';
import Grid5Cols from '@dodao/web-core/components/core/grids/Grid5Cols';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Shorts.module.scss';
import blurDataURL from './BlurDataUrl';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useState } from 'react';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useRouter } from 'next/navigation';
import {
  ShortVideo,
  ShortVideoInput,
  SpaceWithIntegrationsFragment,
  useDeleteShortVideoMutation,
  ProjectShortVideo,
  useShortVideosQuery,
} from '@/graphql/generated/generated-types';

interface ShortsThumbnailProps {
  shortVideo: ShortVideo | ProjectShortVideo;
  space?: SpaceWithIntegrationsFragment;
}

function ShortsThumbnail({ shortVideo, space }: ShortsThumbnailProps) {
  const { thumbnail, title } = shortVideo;
  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteShortVideoMutation] = useDeleteShortVideoMutation();
  const { data, loading, error } = useShortVideosQuery({
    variables: { spaceId: space!.id },
  });
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
          title={'Delete Short Video'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            await deleteShortVideoMutation({ variables: { shortVideoId: shortVideo.id, spaceId: space!.id }, refetchQueries: ['ShortVideos'] });
            setShowDeleteModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
interface ShortsUIProps {
  shortVideos: (ShortVideo | ProjectShortVideo)[];
  space?: SpaceWithIntegrationsFragment;
}

export default function Shorts({ shortVideos, space }: ShortsUIProps) {
  return (
    <PageWrapper>
      <Grid5Cols>
        {shortVideos.map((video, index) => (
          <ShortsThumbnail key={index} shortVideo={video} space={space} />
        ))}
      </Grid5Cols>
    </PageWrapper>
  );
}
