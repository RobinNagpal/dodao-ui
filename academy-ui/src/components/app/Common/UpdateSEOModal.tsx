import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SeoMeta } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

interface UpdateSEOModalProps {
  seoMeta?: SeoMeta | null;
  open: boolean;
  onClose: () => void;
  onSeoMetaUpdate: (seoMeta: SeoMeta) => Promise<void>;
}

export default function UpdateSEOModal(props: UpdateSEOModalProps) {
  const [upserting, setUpserting] = useState(false);
  const [title, setTitle] = useState(props.seoMeta?.title || '');
  const [description, setDescription] = useState(props.seoMeta?.description || '');
  const [keywords, setKeywords] = useState<string[]>(props.seoMeta?.keywords || []);

  const { showNotification } = useNotificationContext();

  const updateSEO = async (title: string, description: string, keywords: string[]) => {
    setUpserting(true);
    try {
      await props.onSeoMetaUpdate({
        title: title || '',
        description: description || '',
        keywords: keywords,
      });
      showNotification({ message: 'Values Updated Successfully', type: 'success' });
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
    setUpserting(false);
  };

  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Basic SEO Settings">
      <div className="project-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Update SEO Fields</h2>
          <Input label="Title" modelValue={title} onUpdate={(value) => setTitle(value?.toString() ?? '')} />
          <Input label="Description" modelValue={description} onUpdate={(value) => setDescription(value?.toString() ?? '')} />
          <Input
            modelValue={keywords.join(', ')}
            label={'Keywords'}
            onUpdate={(value) =>
              setKeywords(
                value
                  ?.toString()
                  .split(',')
                  .map((k) => k.trim()) || []
              )
            }
          />
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          onClick={async () => {
            await updateSEO(title, description, keywords);
            props.onClose();
          }}
        >
          Update SEO Meta
        </Button>
      </div>
    </FullPageModal>
  );
}
