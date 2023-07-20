import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { useState } from 'react';

export interface UploadImageModalProps {
  imageType: string;
  objectId: string;
  spaceId: string;
  open: boolean;
  onClose: () => void;
  imageUploaded: (url: string) => void;
}
export default function UploadImageModal(props: UploadImageModalProps) {
  const { imageType, objectId, spaceId, open, onClose, imageUploaded } = props;
  const [imageURL, setImageURL] = useState<string>();
  return (
    <FullScreenModal open={open} onClose={onClose} title={'Upload Image'}>
      <div className="p-16 text-left">
        <UploadInput
          label={'Upload Image'}
          modelValue={imageURL}
          imageType={imageType}
          objectId={objectId}
          error={null}
          onUpdate={(value) => {
            if (value) {
              setImageURL(value as string);
            }
          }}
          spaceId={spaceId}
          onInput={(url) => {
            setImageURL(url);
          }}
          onLoading={() => {}}
        />
        <div className="mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={!imageURL?.trim()} variant="contained" primary onClick={() => imageUploaded(imageURL as string)} className="ml-4">
            Done
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
