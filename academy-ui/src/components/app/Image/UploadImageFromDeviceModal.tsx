import { CreateSignedUrlInput, ImageType } from '@/graphql/generated/generated-types';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import Button from '@dodao/web-core/components/core/buttons/Button';
import ImageUploadSection from '@dodao/web-core/components/core/file/ImageUploadSection';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';
import { XMarkIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useState } from 'react';

export interface UploadImageModalProps {
  imageType: ImageType;
  objectId: string;
  spaceId: string;
  open: boolean;
  onClose: () => void;
  imageUploaded: (url: string) => void;
  modelValue?: string;
}
export default function UploadImageFromDeviceModal(props: UploadImageModalProps) {
  const { imageType, objectId, spaceId, open, onClose, imageUploaded } = props;
  const [imageURL, setImageURL] = useState<string | null>(props.modelValue || null);
  const [loading, setLoading] = useState(false);
  const { postData } = useFetchUtils();

  async function uploadToS3AndReturnImgUrl(file: File) {
    setLoading(true);
    const input: CreateSignedUrlInput = {
      imageType,
      contentType: file.type,
      objectId: objectId.replace(/[^a-z0-9]/gi, '_'),
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await postData<SingedUrlResponse, CreateSignedUrlRequest>(
      `${getBaseUrl()}/api/s3-signed-urls`,
      { spaceId, input },
      {
        errorMessage: 'Failed to get signed URL',
      }
    );
    const signedUrl = response?.url!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    setImageURL(imageUrl);
    setLoading(false);
  }

  return (
    <FullPageModal open={open} onClose={onClose} title={'Upload Image'}>
      <div className="p-16">
        <ImageUploadSection
          label={'Upload Image'}
          modelValue={imageURL}
          imageType={imageType}
          objectId={objectId}
          error={null}
          spaceId={spaceId}
          uploadToS3AndReturnImgUrl={uploadToS3AndReturnImgUrl}
          loading={loading}
          clearSelectedImage={() => setImageURL(null)}
        />
        <div className=" w-full mt-4 flex justify-between">
          <div>
            <Button onClick={onClose}>Cancel</Button>
          </div>
          <div>
            <Button disabled={!imageURL?.trim()} variant="contained" primary onClick={() => imageUploaded(imageURL as string)} className="ml-4">
              Done
            </Button>
          </div>
        </div>
      </div>
    </FullPageModal>
  );
}
