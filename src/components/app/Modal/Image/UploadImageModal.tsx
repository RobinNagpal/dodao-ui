import UploadInput from '@/components/app/UploadInput';
import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import Button from '@/components/core/buttons/Button';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { useState } from 'react';

interface StepNameAndContent {
  name: string;
  content: string;
}

export interface UploadImageModalProps {
  imageType: string;
  objectId: string;
  spaceId: string;
  open: boolean;
  getCurrentStepNameAndContent?: () => StepNameAndContent;

  onClose: () => void;
  imageUploaded: (url: string) => void;
  generateImagePromptFn?: () => string;
}
export default function UploadImageModal(props: UploadImageModalProps) {
  const { imageType, objectId, spaceId, open, onClose, imageUploaded, getCurrentStepNameAndContent, generateImagePromptFn } = props;
  const [imageURL, setImageURL] = useState<string>();

  return (
    <FullPageModal open={open} onClose={onClose} title={'Upload Image'}>
      <div className="p-8 text-left">
        <UploadInput
          label={'Upload Image'}
          modelValue={imageURL}
          imageType={imageType}
          objectId={objectId}
          error={null}
          spaceId={spaceId}
          generateImagePromptFn={generateImagePromptFn}
          getCurrentStepNameAndContent={getCurrentStepNameAndContent}
          onInput={(url) => {
            setImageURL(url);
          }}
          onLoading={() => {}}
          imageUploaded={imageUploaded}
        />
      </div>
    </FullPageModal>
  );
}
