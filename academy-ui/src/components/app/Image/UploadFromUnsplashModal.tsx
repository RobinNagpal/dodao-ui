import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import dynamic from 'next/dynamic';
import React from 'react';

const UnsplashReact: any = dynamic(() => import('unsplash-react'), {
  ssr: false, // Disable server-side rendering for this component
});

const InsertIntoApplicationUploader = dynamic(() => import('unsplash-react').then((mod) => ({ default: mod.InsertIntoApplicationUploader })));

export interface UploadImageModalProps {
  open: boolean;
  onClose: () => void;
  onInput: (url: string) => void;
}
export default function UploadFromUnsplashModal({ open, onClose, onInput }: UploadImageModalProps) {
  const [unsplashImage, setUnsplashImage] = React.useState<string | null>();

  const handleFinishedUploading = (imageUrl: string) => {
    setUnsplashImage(imageUrl);
  };

  return (
    <FullPageModal open={open} onClose={() => onClose()} title={'Upload Image from Unsplash'}>
      <div className="h-[80vh] p-4">
        <div className="flex justify-end">
          <Button
            disabled={!unsplashImage}
            variant="contained"
            primary
            onClick={() => {
              onInput(unsplashImage!);
            }}
            className="mr-4 mt-2"
          >
            Done
          </Button>
        </div>
        <div className='h-5/6'>          
        <UnsplashReact
          accessKey={process.env.NEXT_PUBLIC_UNSPLASH_API_KEY as string}
          Uploader={InsertIntoApplicationUploader}
          onFinishedUploading={handleFinishedUploading}
        />
        </div>
      </div>
    </FullPageModal>
  );
}
