import UploadInput from '@/components/app/UploadInput';
import Button from '@/components/core/buttons/Button';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { useState } from 'react';

export interface UploadImageModalProps {
  imageType: string;
  objectId: string;
  spaceId: string;
  open: boolean;
  content?: string;
  name?: string;
  onClose: () => void;
  imageUploaded: (url: string) => void;
}
export default function UploadImageModal(props: UploadImageModalProps) {
  const { imageType, objectId, spaceId, open, onClose, imageUploaded, name, content } = props;
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
          name={name}
          content={content}
          onInput={(url) => {
            setImageURL(url);
          }}
          onLoading={() => {}}
          imageUploaded={imageUploaded}
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
