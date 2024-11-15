import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import UploadInput from '@/components/app/UploadInput';
import { ImageType, ShortVideo, ShortVideoInput } from '@/graphql/generated/generated-types';
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

  return (
    <PageWrapper>
      <SingleCardLayout>
        <div className="text-color pb-10">
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

          <UploadInput
            error={shortVideoErrors['thumbnail']}
            imageType={ImageType.ShortVideo}
            spaceId={spaceId}
            modelValue={shortVideo.thumbnail}
            objectId={shortVideo.id || 'new-short-video' + '-thumbnail'}
            onInput={(value) => updateShortVideoField('thumbnail', value?.toString() || '')}
            label={'Thumbnail*'}
            placeholder="e.g. https://example.com/thumbnail.png"
          />
          <UploadInput
            error={shortVideoErrors['videoUrl']}
            imageType={ImageType.ShortVideo}
            spaceId={spaceId}
            modelValue={shortVideo.videoUrl}
            objectId={shortVideo.id || 'new-short-video' + '-short-video'}
            onInput={(value) => updateShortVideoField('videoUrl', value?.toString() || '')}
            allowedFileTypes={['video/mp4', 'video/x-m4v', 'video/*']}
            label={'Video*'}
            placeholder="e.g. https://example.com/video.mp4"
          />

          <div className="mt-6 flex justify-center items-center">
            <Button onClick={() => upsertShortVideo()} loading={shortVideoUpserting} variant="contained" primary>
              Save
            </Button>
          </div>
        </div>
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
    </PageWrapper>
  );
}
