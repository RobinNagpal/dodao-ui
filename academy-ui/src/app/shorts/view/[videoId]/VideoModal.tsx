'use client';

import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { ShortVideo } from '@/graphql/generated/generated-types';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

interface VideoModalProps {
  space: SpaceWithIntegrationsDto;
  video: ShortVideo;
}

function VideoModal({ space, video }: VideoModalProps) {
  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const handleVideoComplete = (videoId: string) => {
    console.log('Video completed:', videoId);
    showNotification({
      type: 'success',
      message: `You've successfully completed this video. Ready for the next one?`,
      heading: 'Success 🎉',
    });

    const completedVideos = JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_SHORT_VIDEO) || '[]');
    localStorage.setItem(LocalStorageKeys.COMPLETED_SHORT_VIDEO, JSON.stringify([...new Set([...completedVideos, videoId])]));
  };
  return (
    <FullScreenModal
      title={video.title}
      open={true}
      onClose={() => (space.type === SpaceTypes.TidbitsSite ? router.push(`/?updated=${Date.now()}`) : router.push('/tidbit-collections'))}
    >
      <div className="flex justify-center items-center w-full min-h-screen">
        <div className="m-5 max-w-4xl">
          <video
            id={video.id}
            autoPlay={true}
            controls
            controlsList="nofullscreen" //disable full-screen option - only for Chrome
            poster={video.thumbnail}
            width="100%"
            style={{ maxHeight: '80vh', maxWidth: '100vw', border: '1px solid var(--border-color)' }}
            onEnded={() => handleVideoComplete(video.id)}
          >
            <source src={video.videoUrl} type="video/mp4" />
          </video>
        </div>
      </div>
    </FullScreenModal>
  );
}

export default VideoModal;
