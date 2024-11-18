import { useEditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import React from 'react';

interface ByteCollectionEditorProps {
  space: SpaceWithIntegrationsDto;
  byteCollection?: ByteCollectionSummary;
  onClose: () => void;
}

export default function ByteCollectionEditModal(props: ByteCollectionEditorProps) {
  const { isPrestine, loading, byteCollection, helperFunctions } = useEditByteCollection({
    space: props.space,
    byteCollection: props.byteCollection,
  });

  return (
    <FullScreenModal open={true} onClose={props.onClose} title={props.byteCollection ? `Edit - ${byteCollection.name}` : 'Create Tidbit Collection'}>
      <div className="text-left">
        <PageWrapper>
          <SingleCardLayout>
            <div className="text-color">
              <Input
                modelValue={byteCollection.name}
                onUpdate={(v) => helperFunctions.updateByteCollectionName(v?.toString() || '')}
                label="Name *"
                required
                error={isPrestine || byteCollection.name.trim() ? false : 'Name is Required'}
              />

              <TextareaAutosize
                label={'Description *'}
                modelValue={byteCollection.description}
                onUpdate={(v) => helperFunctions.updateByteCollectionDescription(v?.toString() || '')}
                error={isPrestine || byteCollection.description.trim() ? false : 'Description is Required'}
              />

              <Input
                modelValue={byteCollection.videoUrl}
                placeholder="Enter VideoURL"
                maxLength={1024}
                onUpdate={(v) => helperFunctions.updateByteCollectionVideoUrl(v?.toString() || '')}
              >
                Video URL
              </Input>

              <Input
                modelValue={byteCollection.order}
                number
                onUpdate={(v) => helperFunctions.updateByteCollectionOrder(v ? parseInt(v.toString()) : 100)}
                label="Byte Collection Order *"
                required
              />

              <div className="py-4">
                <Button
                  variant="contained"
                  primary
                  loading={loading}
                  disabled={loading}
                  onClick={() => {
                    helperFunctions.upsertByteCollection();
                    props.onClose();
                  }}
                >
                  {props.byteCollection ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </SingleCardLayout>
        </PageWrapper>
      </div>
    </FullScreenModal>
  );
}
