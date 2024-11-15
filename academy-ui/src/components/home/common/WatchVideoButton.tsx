'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import React from 'react';

function PlayIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="11.5" stroke="#000000" />
      <path d="M9.5 14.382V9.618a.5.5 0 0 1 .724-.447l4.764 2.382a.5.5 0 0 1 0 .894l-4.764 2.382a.5.5 0 0 1-.724-.447Z" fill="#000000" stroke="#000000" />
    </svg>
  );
}

interface VideoFullScreenModalProps {
  open: boolean;
  onClose: () => void;
  src: string;
}
function VideoFullScreenModal({ open, onClose, src }: VideoFullScreenModalProps) {
  return (
    <FullScreenModal open={open} onClose={onClose} title="Breaking Down Complex Concepts: The Tidbits Method">
      <div className="w-full min-h-screen flex flex-col justify-center align-center">
        <div className="h-full w-full flex justify-center">
          <div className="rounded-2xl max-w-4xl">
            <video
              controls //enables video control options
              controlsList="nofullscreen" //disable full-screen option - only for Chrome
              loop //puts the videos on playback
              width="100%"
              autoPlay={true}
              style={{ maxHeight: '80vh', maxWidth: '100vw' }}
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
}
export function WatchVideoButton(props: { src: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button removeBorder onClick={() => setOpen(true)}>
        <PlayIcon className="h-6 w-6 flex-none" />
        <span className="text-gray-900 ml-2.5 hover:underline">Watch & Learn</span>
      </Button>
      <VideoFullScreenModal open={open} onClose={() => setOpen(false)} src={props.src} />
    </>
  );
}
