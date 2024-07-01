import { useEditByteCollectionCategory } from './useEditByteCollectionCategory';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { ByteCollectionFragment, CategoryWithByteCollection, ImageType, Space, ByteCollectionCategoryStatus } from '@/graphql/generated/generated-types';
import PlusCircle from '@heroicons/react/20/solid/PlusCircleIcon';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import React, { useState } from 'react';
import styled from 'styled-components';
import SelectByteCollectionModal from './SelectByteCollectionModal';
import UploadInput from '../app/UploadInput';
import NativeSelect from '@dodao/web-core/components/core/select/NativeSelect';
import Image from 'next/image';

interface ByteCollectionCategoryEditorProps {
  byteCategorySummary?: CategoryWithByteCollection;
  space: Space;
}

interface StatusItem {
  id: string;
  label: string;
}

const AddByteButton = styled.button`
  color: var(--primary-color);
`;

const TidBitIconSpan = styled.span`
  background-color: var(--primary-color);
`;

function ByteCollectionCategoryEditor(props: ByteCollectionCategoryEditorProps) {
  const [showSelectByteCollectionModal, setShowSelectByteCollectionModal] = useState(false);
  const { byteCategory, categoryErrors, upserting, helperFunctions } = useEditByteCollectionCategory({
    space: props.space,
    byteCategory: props.byteCategorySummary,
  });

  const options: StatusItem[] = [
    { id: ByteCollectionCategoryStatus.Active, label: 'Active' },
    { id: ByteCollectionCategoryStatus.Hidden, label: 'Hidden' },
    { id: ByteCollectionCategoryStatus.ComingSoon, label: 'Coming Soon' },
    { id: ByteCollectionCategoryStatus.TryItOut, label: 'Try It Out' },
  ];

  return (
    <div>
      <Input
        label="Name *"
        modelValue={byteCategory.name}
        onUpdate={(v) => helperFunctions.updateByteCategoryName(v?.toString() || '')}
        required
        onBlur={() => helperFunctions.validateCategory()}
        error={categoryErrors['name'] ? 'Name is required' : false}
      />

      <TextareaAutosize
        label={'Excerpt *'}
        modelValue={byteCategory.excerpt || ''}
        onUpdate={(v) => helperFunctions.updateByteCategoryExcerpt(v?.toString() || '')}
        onBlur={() => helperFunctions.validateCategory()}
        error={categoryErrors['excerpt'] ? 'Excerpt is Required' : false}
      />

      <UploadInput
        imageType={ImageType.Tidbits}
        spaceId={props.space.id}
        objectId={byteCategory.id || 'new-category' + '-thumbnail'}
        onInput={(value) => helperFunctions.updateByteCategoryImageUrl(value?.toString() || '')}
        modelValue={byteCategory.imageUrl || ''}
      />

      {byteCategory.imageUrl && <Image src={byteCategory.imageUrl} alt="Byte Collection Category Image" height={150} width={150} className="my-2" />}

      <NativeSelect
        label="Select the status"
        items={options}
        setSelectedItemId={helperFunctions.updateByteCategoryStatus}
        selectedItemId={byteCategory.status || ByteCollectionCategoryStatus.Active}
      />

      <Input
        modelValue={byteCategory.priority}
        number
        onUpdate={(v) => helperFunctions.updateByteCollectionPriority(parseInt(v?.toString() as string))}
        label="Byte Collection Category Priority"
        required
        error={categoryErrors['priority'] ? 'Priority is Required' : false}
      />

      <div className="my-4">
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {byteCategory.byteCollections.map((byteCollection: ByteCollectionFragment, byteIndex: any) => (
              <li key={byteCollection.id}>
                <div className="relative pb-8">
                  {byteIndex !== byteCategory.byteCollections.length - 1 ? (
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
                              <span className={'font-bold'}>{byteCollection.name}</span> - <span>{byteCollection.description}</span>
                            </div>
                            <div className="h-10" style={{ minHeight: '40px' }}>
                              <IconButton
                                className="float-right ml-1"
                                iconName={IconTypes.Trash}
                                removeBorder
                                disabled={byteCategory.byteCollections.length === 1}
                                onClick={() => helperFunctions.removeByteCollection(byteCollection.id)}
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

          {showSelectByteCollectionModal && (
            <SelectByteCollectionModal
              showSelectBytesModal={showSelectByteCollectionModal}
              onClose={() => setShowSelectByteCollectionModal(false)}
              addByteCollection={(byteCollections: ByteCollectionFragment[]) => {
                byteCollections.forEach((byteColl) => {
                  helperFunctions.addByteCollection(byteColl);
                });

                setShowSelectByteCollectionModal(false);
              }}
              space={props.space}
            />
          )}
        </div>
      </div>
      <div className="flex py-2 cursor-pointer" onClick={() => setShowSelectByteCollectionModal(true)}>
        <AddByteButton className="rounded-full text-2xl bg-primary text-white mr-2">
          <PlusCircle height={25} width={25} />
        </AddByteButton>
        <div>Add Byte Collections</div>
      </div>

      <div className="py-4">
        <Button
          variant="contained"
          primary
          onClick={() => helperFunctions.upsertByteCollectionCategory()}
          disabled={!byteCategory.name.trim() || !byteCategory.excerpt.trim() || !byteCategory.priority || upserting}
          loading={upserting}
        >
          Upsert Byte Collection Category
        </Button>
      </div>
    </div>
  );
}

export default ByteCollectionCategoryEditor;
