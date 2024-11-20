import { ImageType, ShortVideo, ShortVideoInput, CreateSignedUrlInput } from '@/graphql/generated/generated-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 } from 'uuid';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { useI18 } from '@/hooks/useI18';
import EditableImage from '@dodao/web-core/components/core/image/EditableImage';
import EditableVideo from '@dodao/web-core/components/core/image/EditableVideo';
import UploadImageFromDeviceModal from '@/components/app/Image/UploadImageFromDeviceModal';
import axios from 'axios';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import { getUploadedImageUrlFromSingedUrl } from '@dodao/web-core/utils/upload/getUploadedImageUrlFromSingedUrl';

export interface EditShortVideoModalProps {
  shortVideoToEdit?: ShortVideo;
  spaceId: string;
  closeEditShortModal?: () => void;
  saveShortVideoFn: (video: ShortVideoInput) => Promise<void>;
  onCancel: () => void;
  onAfterSave?: () => void;
}

export default function EditShortVideoModal({
  shortVideoToEdit,
  spaceId,
  saveShortVideoFn,
  onCancel,
  onAfterSave,
  closeEditShortModal,
}: EditShortVideoModalProps) {
  const [shortVideo, setShortVideo] = React.useState<ShortVideoInput>({
    id: shortVideoToEdit?.id || v4(),
    title: shortVideoToEdit?.title || '',
    description: shortVideoToEdit?.description || '',
    priority: shortVideoToEdit?.priority || 50,
    videoUrl: shortVideoToEdit?.videoUrl || '',
    thumbnail: shortVideoToEdit?.thumbnail || '',
  });

  useEffect(() => {
    if (shortVideoToEdit) {
      setShortVideo(shortVideoToEdit);
    }
  }, [shortVideoToEdit]);

  const updateShortVideoField = (field: keyof ShortVideoInput, value: any) => {
    setShortVideo((prev) => ({ ...prev, [field]: value }));
  };

  const router = useRouter();
  const [shortVideoUpserting, setShortVideoUpserting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);
  const [uploadFileLoading, setUploadFileLoading] = useState(false);

  const threeDotItems: EllipsisDropdownItem[] = [{ label: 'Delete', key: 'delete' }];
  const { $t } = useI18();

  const [shortVideoErrors, setshortVideoErrors] = useState<Record<keyof ShortVideoInput, any>>({
    id: null,
    title: null,
    description: null,
    priority: null,
    thumbnail: null,
    videoUrl: null,
    archive: false,
  });

  async function handleDelete() {
    const response = await fetch(`${getBaseUrl()}/api/short-videos/${shortVideo.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ spaceId }),
    });
  }

  const { showNotification } = useNotificationContext();
  const { postData } = usePostData<SingedUrlResponse, CreateSignedUrlRequest>(
    {
      errorMessage: 'Failed to get signed URL',
    },
    {}
  );
  const upsertShortVideo = async () => {
    const errors: Record<keyof ShortVideoInput, any> = {
      id: null,
      title: null,
      description: null,
      priority: null,
      thumbnail: null,
      videoUrl: null,
      archive: false,
    };
    if (!shortVideo.title) {
      errors['title'] = 'Title is required';
    }
    if (!shortVideo.description) {
      errors['description'] = 'Description is required';
    }

    if (!shortVideo.thumbnail) {
      errors['thumbnail'] = 'Video thumbnail is required';
    }

    if (!shortVideo.videoUrl) {
      errors['videoUrl'] = 'Video is required';
    }

    setshortVideoErrors(errors);

    if (Object.values(errors).some((v) => !!v)) {
      showNotification({ type: 'error', message: $t('notify.validationFailed') });
      return;
    }

    setShortVideoUpserting(true);

    try {
      await saveShortVideoFn(shortVideo);
      showNotification({ message: 'Short video saved successfully!', type: 'success' });
      router.push(`/shorts/view/${shortVideo?.id}`);
    } catch (e) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }

    setShortVideoUpserting(false);
    if (onAfterSave) {
      onAfterSave();
    }
  };

  async function uploadToS3AndReturnImgUrl(file: File) {
    setUploadFileLoading(true);
    const input: CreateSignedUrlInput = {
      imageType: ImageType.ShortVideo,
      contentType: file.type,
      objectId: (shortVideo.id || 'new-short-video' + '-short-video').replace(/[^a-z0-9]/gi, '_'),
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await postData(`${getBaseUrl()}/api/s3-signed-urls`, { spaceId, input });
    const signedUrl = response?.url!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    updateShortVideoField('videoUrl', imageUrl?.toString() || '');

    setUploadFileLoading(false);
  }

  return (
    <PageWrapper>
      <SingleCardLayout>
        <PageWrapper>
          <div className="text-color">
            <div className="py-2 my-2">
              <div className="float-right">
                {shortVideoToEdit && (
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      if (key === 'delete') {
                        setShowDeleteModal(true);
                      }
                    }}
                    className="ml-4"
                  />
                )}
              </div>
            </div>
            <div className="mb-2">
              <Input
                modelValue={shortVideo.title}
                maxLength={32}
                onUpdate={(v) => updateShortVideoField('title', v?.toString() || '')}
                label="Title*"
                required
                placeholder="only 32 characters"
                error={shortVideoErrors['title']}
              />
            </div>
            <div className="mb-2">
              <Input
                modelValue={shortVideo.description}
                maxLength={64}
                label="Description*"
                placeholder="only 64 characters"
                onUpdate={(v) => updateShortVideoField('description', v?.toString() || '')}
                error={shortVideoErrors['description']}
              />
            </div>

            <div className="w-full my-2 flex flex-wrap sm:flex-nowrap justify-around gap-5">
              <EditableImage
                imageUrl={shortVideo.thumbnail}
                onRemove={() => updateShortVideoField('thumbnail', '')}
                onUpload={() => setSelectImageUploadModal(true)}
                height="200px"
                label="Select Thumbnail"
                error={shortVideoErrors['thumbnail']}
              />

              <EditableVideo
                videoUrl={shortVideo.videoUrl}
                onRemove={() => updateShortVideoField('videoUrl', '')}
                height="200px"
                label="Select Video"
                onUpload={uploadToS3AndReturnImgUrl}
                loading={uploadFileLoading}
                error={shortVideoErrors['videoUrl']}
              />
            </div>

            <div className="mt-10 flex justify-center items-center">
              <Button onClick={() => upsertShortVideo()} loading={shortVideoUpserting} variant="contained" primary>
                Save
              </Button>
            </div>
          </div>
        </PageWrapper>
      </SingleCardLayout>
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={`Delete Short Video - ${shortVideo.title}`}
          deleteButtonText="Delete Short Video"
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            handleDelete();
            const timestamp = new Date().getTime();
            router.push(`/tidbit-collections?update=${timestamp}`);
            setShowDeleteModal(false);
            setTimeout(() => closeEditShortModal?.(), 3000);
          }}
        />
      )}
      {selectImageUploadModal && (
        <UploadImageFromDeviceModal
          open={selectImageUploadModal}
          onClose={() => setSelectImageUploadModal(false)}
          imageType={ImageType.ShortVideo}
          objectId={shortVideo.id || 'new-short-video' + '-short-video'}
          spaceId={spaceId}
          imageUploaded={(imageUrl) => {
            updateShortVideoField('thumbnail', imageUrl?.toString() || '');
            setSelectImageUploadModal(false);
          }}
          modelValue={shortVideo.thumbnail || undefined}
        />
      )}
    </PageWrapper>
  );
}
