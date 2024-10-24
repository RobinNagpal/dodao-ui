import { useEditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import { Space } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import React from 'react';

interface ByteCollectionEditorProps {
  space: Space;
  byteCollection?: ByteCollectionSummary;
  viewByteCollectionsUrl: string;
}

export default function ByteCollectionEditor(props: ByteCollectionEditorProps) {
  const { isPrestine, loading, byteCollection, helperFunctions } = useEditByteCollection({
    space: props.space,
    viewByteCollectionsUrl: props.viewByteCollectionsUrl,
    redirectPath: props.viewByteCollectionsUrl + '?updated=' + Date.now(),
    byteCollection: props.byteCollection,
  });

  return (
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
        modelValue={byteCollection.priority}
        number
        onUpdate={(v) => helperFunctions.updateByteCollectionPriority(v ? parseInt(v.toString()) : 50)}
        label="Byte Collection Priority *"
        required
      />

      <div className="py-4">
        <Button variant="contained" primary loading={loading} disabled={loading} onClick={() => helperFunctions.upsertByteCollection()}>
          {byteCollection ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
