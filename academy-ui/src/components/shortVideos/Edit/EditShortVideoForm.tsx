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
    if (!shortVideo.title || shortVideo.title.length < 3) {
      errors['title'] = 'Add a proper title';
    }
    if (!shortVideo.description || shortVideo.description.length < 5) {
      errors['description'] = 'Add a proper description';
    }

    if (!shortVideo.thumbnail) {
      errors['thumbnail'] = 'Add a thumbnail';
    }

    if (!shortVideo.videoUrl) {
      errors['videoUrl'] = 'Add a video';
    }

    if (shortVideo.priority < 0 || shortVideo.priority > 100) {
      errors['priority'] = 'Priority must be between 0 and 100';
    }

    setshortVideoErrors(errors);

    if (Object.values(errors).some((v) => !!v)) {
      return;
    }

    setShortVideoUpserting(true);

    try {
      await saveShortVideoFn(shortVideo);
      showNotification({ message: 'Short video saved', type: 'success' });
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
    <div className="text-left">
      <div className="px-4 mb-4 md:px-0 float-right">
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
      <Input
        modelValue={shortVideo.title}
        onUpdate={(v) => updateShortVideoField('title', v?.toString() || '')}
        label="Title"
        required
        error={shortVideoErrors['title']}
      />

      <MarkdownEditor
        id={shortVideo.id + '-description'}
        modelValue={shortVideo.description}
        placeholder={'Description'}
        onUpdate={(v) => updateShortVideoField('description', v?.toString() || '')}
        spaceId={spaceId}
        objectId={shortVideo.id}
        imageType={ImageType.ShortVideo}
        className="w-full"
        label={'Description'}
        error={shortVideoErrors['description']}
      />

      <UploadInput
        error={shortVideoErrors['thumbnail']}
        imageType={ImageType.ShortVideo}
        spaceId={spaceId}
        modelValue={shortVideo.thumbnail}
        objectId={shortVideo.id || 'new-short-video' + '-thumbnail'}
        onInput={(value) => updateShortVideoField('thumbnail', value?.toString() || '')}
        label={'Thumbnail'}
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
        label={'Video'}
        placeholder="e.g. https://example.com/video.mp4"
      />

      <Input
        modelValue={shortVideo.priority}
        onUpdate={(v) => {
          const priorityString = v?.toString() || '50';
          updateShortVideoField('priority', parseInt(priorityString));
        }}
        label={'Priority'}
        number
        required
        error={shortVideoErrors['priority']}
      />
      <div className="flex mt-4">
        <Button onClick={() => upsertShortVideo()} loading={shortVideoUpserting} variant="contained" primary>
          Save
        </Button>
        <Button onClick={() => onCancel()} className="ml-2" variant="contained">
          Cancel
        </Button>
        {showDeleteModal && (
          <DeleteConfirmationModal
            title={'Delete Short Video'}
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
      </div>
    </div>
  );
}
