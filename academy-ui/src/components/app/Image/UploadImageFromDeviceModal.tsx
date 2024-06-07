import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ImageType } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export interface UploadImageModalProps {
  imageType: ImageType;
  objectId: string;
  spaceId: string;
  open: boolean;
  onClose: () => void;
  imageUploaded: (url: string) => void;
}
export default function UploadImageFromDeviceModal(props: UploadImageModalProps) {
  const { imageType, objectId, spaceId, open, onClose, imageUploaded } = props;
  const [imageURL, setImageURL] = useState<string>();

  return (
    <FullPageModal open={open} onClose={onClose} title={'Upload Image'}>
      <div className="p-16 text-left">
        <UploadInput
          label={'Upload Image'}
          modelValue={imageURL}
          imageType={imageType}
          objectId={objectId}
          error={null}
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
    </FullPageModal>
  );
}
