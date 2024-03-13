import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Input from '@/components/core/input/Input';
import { InputWithButton } from '@/components/core/input/InputWithButton';
import { CompletionScreen, CompletionScreenItemInput, ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import SelectImageInputModal from '@/components/app/Image/SelectImageInputModal';
import CompletionScreenItemModal from '@/components/app/Modal/CompletionScreenItem/CompletionScreenItemModal';

interface EditCompletionScreenStepperItemProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  updateByteCompletionScreen: (field: keyof CompletionScreen, value: any) => void;
  removeCompletionScreen: () => void;
}

const StyledStepItemContainer = styled.div`
  width: 100%;
`;

export default function EditCompletionScreenStepperItem({
  space,
  byte,
  updateByteCompletionScreen,
  removeCompletionScreen,
}: EditCompletionScreenStepperItemProps) {
  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);
  const [modalAddButtonInput, setModalAddButtonInput] = useState(false);

  const updateCompletionScreenImageUrl = (imageUrl: string | null) => {
    updateByteCompletionScreen('imageUrl', imageUrl);
  };

  const handleDelete = () => {
    removeCompletionScreen();
  };

  const updateCompletionScreenContent = (content: string) => {
    updateByteCompletionScreen('content', content);
  };
  function addButton() {
    const input: CompletionScreenItemInput = {
      uuid: 'myinput',
      label: 'Button',
      link: 'google',
    };
    updateByteCompletionScreen('items', input);
  }

  return (
    <StyledStepItemContainer className="w-full">
      <div>
        <div style={{ minHeight: '20px' }}>
          <IconButton
            className="float-right ml-2"
            iconName={IconTypes.GuideAddIcon}
            disabled={byte.completionScreen?.items.length != undefined ? byte.completionScreen?.items.length >= 1 : false}
            removeBorder
            onClick={() => setModalAddButtonInput(true)}
          />
          <IconButton className="float-right ml-2" iconName={IconTypes.Trash} removeBorder onClick={() => handleDelete()} />
        </div>
        <div className="w-full mb-4">
          <Input
            modelValue={byte.completionScreen?.name}
            required
            onUpdate={(e) => {
              updateByteCompletionScreen('name', e?.toString());
            }}
          >
            Name*
          </Input>
        </div>
        <div className="w-full mb-4">
          <InputWithButton
            buttonLabel={'Set Image'}
            inputLabel={'Image Url'}
            onButtonClick={() => setSelectImageUploadModal(true)}
            onInputUpdate={(e) => {
              updateCompletionScreenImageUrl(e?.toString() || '');
            }}
            inputModelValue={byte.completionScreen?.imageUrl ?? ''}
          />
        </div>

        <MarkdownEditor
          id={byte.completionScreen?.uuid || byte.id}
          modelValue={byte.completionScreen?.content}
          placeholder={'Contents'}
          onUpdate={updateCompletionScreenContent}
          spaceId={space.id}
          objectId={byte.id || 'unknown_byte_id'}
          imageType={ImageType.Tidbits}
          editorStyles={{ height: '200px' }}
        />
      </div>

      {selectImageUploadModal && (
        <SelectImageInputModal
          open={selectImageUploadModal}
          onClose={() => setSelectImageUploadModal(false)}
          imageType={ImageType.Tidbits}
          objectId={byte.id || 'unknown_byte_id'}
          spaceId={space.id}
          imageUploaded={(imageUrl) => {
            updateCompletionScreenImageUrl(imageUrl);
            setSelectImageUploadModal(false);
          }}
        />
      )}

      {modalAddButtonInput && (
        <CompletionScreenItemModal
          open={modalAddButtonInput}
          onClose={() => setModalAddButtonInput(false)}
          onAddButton={() => {
            addButton();
          }}
        />
      )}
    </StyledStepItemContainer>
  );
}
function uuidv4(): string {
  throw new Error('Function not implemented.');
}
