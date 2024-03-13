import { EditByteType, KeyOfByteInput, UpdateByteFunctions } from '@/components/bytes/Edit/editByteHelper';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Input from '@/components/core/input/Input';
import { InputWithButton } from '@/components/core/input/InputWithButton';
import { CompletionScreen, ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';
import styled from 'styled-components';

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
  const handleDelete = () => {
    onRemoveCompletionScreen();
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
              console.log('I am byte completion screen: ', byte.completionScreen);
            }}
          >
            Name*
          </Input>
        </div>
        <div className="w-full mb-4">
          <InputWithButton
            buttonLabel={'Set Image'}
            inputLabel={'Image Url'}
            onButtonClick={() => {}}
            onInputUpdate={() => {}}
            inputModelValue={byte.completionScreen?.imageUrl ?? ''}
          />
        </div>

        <MarkdownEditor
          id={''}
          modelValue={byte.completionScreen?.content}
          placeholder={'Contents'}
          onUpdate={() => {}}
          spaceId={space.id}
          objectId={byte.id || 'unknown_byte_id'}
          imageType={ImageType.Tidbits}
          editorStyles={{ height: '200px' }}
        />
      </div>
    </StyledStepItemContainer>
  );
}
