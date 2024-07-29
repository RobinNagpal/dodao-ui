import { EditByteCollection, useEditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectByteFragment, Space } from '@/graphql/generated/generated-types';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import React from 'react';
import styled from 'styled-components';

interface ByteCollectionEditorProps {
  space: Space;
  byteCollection?: ByteCollectionFragment | ProjectByteCollectionFragment;
  viewByteCollectionsUrl: string;
  upsertByteCollectionFn: (byteCollection: EditByteCollection, byteCollectionId: string | null) => Promise<void>;
}

const TidBitIconSpan = styled.span`
  background-color: var(--primary-color);
`;

function ByteCollectionEditor(props: ByteCollectionEditorProps) {
  const { isPrestine, loading, byteCollection, helperFunctions } = useEditByteCollection({
    space: props.space,
    viewByteCollectionsUrl: props.viewByteCollectionsUrl,
    byteCollection: props.byteCollection,
    upsertByteCollectionFn: props.upsertByteCollectionFn,
  });

  return (
    <div>
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

      <div className="my-4">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {byteCollection.bytes.map((byte, byteIndex) => (
              <li key={byte.byteId}>
                <div className="relative pb-8">
                  {byteIndex !== byteCollection.bytes.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <TidBitIconSpan className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
                        <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </TidBitIconSpan>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-2 pt-1.5">
                      <div>
                        <p className="text-sm">
                          <div className="flex">
                            <div>
                              <span className={'font-bold'}>{byte.name}</span> - <span>{byte.content}</span>
                            </div>
                            <div className="h-10" style={{ minHeight: '40px' }}>
                              <IconButton
                                className="float-right ml-1"
                                iconName={IconTypes.Trash}
                                removeBorder
                                disabled={byteCollection.bytes.length === 1}
                                onClick={() => helperFunctions.removeByte(byte.byteId)}
                              />
                              <IconButton
                                className="float-right ml-1"
                                iconName={IconTypes.MoveUp}
                                removeBorder
                                disabled={byteIndex === 0}
                                onClick={() => helperFunctions.moveByteUp(byte.byteId)}
                              />
                              <IconButton
                                className="float-right ml-1"
                                iconName={IconTypes.MoveDown}
                                removeBorder
                                disabled={byteIndex + 1 === byteCollection.bytes.length}
                                onClick={() => helperFunctions.moveByteDown(byte.byteId)}
                              />
                            </div>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="py-4">
        <Button variant="contained" primary loading={loading} disabled={loading} onClick={() => helperFunctions.upsertByteCollection()}>
          Upsert Byte Collection
        </Button>
      </div>
    </div>
  );
}

export default ByteCollectionEditor;
