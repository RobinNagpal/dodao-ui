import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import UploadInput from '@/components/app/UploadInput';
import Input from '@/components/core/input/Input';
import { ShortVideoInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export interface EditShortVideoModalProps {
  onClose: () => void;
  shortVideoToEdit?: ShortVideoInput;
  space: SpaceWithIntegrationsFragment;
}

export default function EditShortVidesView({ onClose, shortVideoToEdit, space }: EditShortVideoModalProps) {
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

  const [shortVideoErrors, setshortVideoErrors] = useState<Record<keyof ShortVideoInput, any>>({
    id: null,
    title: null,
    description: null,
    priority: null,
    thumbnail: null,
    videoUrl: null,
  });

  return (
    <div>
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
        spaceId={space.id}
        objectId={shortVideo.id}
        imageType="ShortVideo"
        className="w-full"
      />

      <UploadInput
        error={shortVideoErrors['thumbnail']}
        imageType="ShortVideo"
        spaceId={space.id}
        modelValue={shortVideo.thumbnail}
        objectId={shortVideo.id || 'new-short-video' + '-thumbnail'}
        onInput={(value) => updateShortVideoField('thumbnail', value?.toString() || '')}
        label={'Thumbnail'}
        placeholder="e.g. https://example.com/thumbnail.png"
      />
      <UploadInput
        error={shortVideoErrors['videoUrl']}
        imageType="ShortVideo"
        spaceId={space.id}
        modelValue={shortVideo.thumbnail}
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
    </div>
  );
}
