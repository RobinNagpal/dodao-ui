import SelectBytesModal from '@/components/byteCollection/ByteCollections/SelectBytesModal';
import { useEditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import Button from '@/components/core/buttons/Button';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import Input from '@/components/core/input/Input';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { ByteCollectionFragment, Space } from '@/graphql/generated/generated-types';
import { CheckIcon } from '@heroicons/react/20/solid';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import React, { useState } from 'react';
import styled from 'styled-components';

interface ByteCollectionEditorProps {
  space: Space;
  byteCollection?: ByteCollectionFragment;
}

const AddByteButton = styled.button`
  color: var(--primary-color);
`;

function ByteCollectionEditor(props: ByteCollectionEditorProps) {
  const [showSelectBytesModal, setShowSelectBytesModal] = useState(false);
  const { isPrestine, byteCollection, byteSummaries, helperFunctions } = useEditByteCollection(props.space, props.byteCollection?.id || null);

  return (
    <div>
      <Input
        modelValue={byteCollection.name}
        onUpdate={(v) => helperFunctions.updateByteCollectionName(v?.toString() || '')}
        label="Name"
        required
        error={isPrestine || byteCollection.name.trim() ? false : 'Name is Required'}
      />

      <TextareaAutosize
        label={'Description'}
        modelValue={byteCollection.description}
        onUpdate={(v) => helperFunctions.updateByteCollectionDescription(v?.toString() || '')}
        error={isPrestine || byteCollection.description.trim() ? false : 'Description is Required'}
      />

      <Input
        modelValue={byteCollection.order}
        number
        onUpdate={(v) => helperFunctions.updateByteCollectionOrder(v ? parseInt(v.toString()) : 50)}
        label="Byte Collection Priority"
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
                      <span className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
                        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-2 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
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

          {showSelectBytesModal && (
            <SelectBytesModal
              showSelectBytesModal={showSelectBytesModal}
              onClose={() => setShowSelectBytesModal(false)}
              byteSummaries={byteSummaries}
              addBytes={(byteIds: string[]) => {
                byteIds.forEach((byteId) => {
                  helperFunctions.addByte(byteId);
                });

                setShowSelectBytesModal(false);
              }}
            />
          )}
        </div>
      </div>
      <div className="flex py-2 cursor-pointer" onClick={() => setShowSelectBytesModal(true)}>
        <AddByteButton className="rounded-full text-2xl bg-primary text-white mr-2">
          <PlusCircle height={25} width={25} />
        </AddByteButton>
        <div>Add Bytes</div>
      </div>

      <div className="py-4">
        <Button variant="contained" primary onClick={() => helperFunctions.upsertByteCollection()}>
          Upsert Byte Collection
        </Button>
      </div>
    </div>
  );
}

export default ByteCollectionEditor;
