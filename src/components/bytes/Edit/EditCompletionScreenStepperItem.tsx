import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Input from '@/components/core/input/Input';
import { InputWithButton } from '@/components/core/input/InputWithButton';
import { CompletionScreen, ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import SelectImageInputModal from '@/components/app/Image/SelectImageInputModal';

interface EditCompletionScreenStepperItemProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
  updateByteCompletionScreen: (field: keyof CompletionScreen, value: any) => void;
  onRemoveCompletionScreen: () => void;
}

const StyledStepItemContainer = styled.div`
  width: 100%;
`;

export default function EditCompletionScreenStepperItem({
  space,
  byte,
  onRemoveCompletionScreen,
  updateByteCompletionScreen,
}: EditCompletionScreenStepperItemProps) {
  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);
  const handleDelete = () => {
    onRemoveCompletionScreen();
  };

  const updateCompletionScreenImageUrl = (imageUrl: string | null) => {
    updateByteCompletionScreen('imageUrl', imageUrl);
  };

  const updateCompletionScreenContent = (content: string) => {
    updateByteCompletionScreen('content', content);
  };

  return (
    <StyledStepItemContainer className="w-full">
      <div>
        <div style={{ minHeight: '20px' }}>
          <IconButton className="float-right ml-2" iconName={IconTypes.Trash} removeBorder disabled={byte.steps.length === 1} onClick={handleDelete} />
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
    </StyledStepItemContainer>
  );
}
