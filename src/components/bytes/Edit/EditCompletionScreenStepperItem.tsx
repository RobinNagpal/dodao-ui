import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import IconButton from '@/components/core/buttons/IconButton';
import { IconTypes } from '@/components/core/icons/IconTypes';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Input from '@/components/core/input/Input';
import { InputWithButton } from '@/components/core/input/InputWithButton';
import { ImageType, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import styled from 'styled-components';

interface EditCompletionScreenStepperItemProps {
  space: SpaceWithIntegrationsFragment;
  byte: EditByteType;
}

const StyledStepItemContainer = styled.div`
  width: 100%;
`;

const StepItemWrapper = styled.div<{ hasError: boolean }>`
  border: ${(props) => (props.hasError ? '1px solid red' : '1px solid var(--border-color)')};
  border-radius: 0.5rem;
  padding: 1rem;
`;
export default function EditCompletionScreenStepperItem({ space, byte }: EditCompletionScreenStepperItemProps) {
  return (
    <StyledStepItemContainer className="w-full">
      <div>
        <div style={{ minHeight: '20px' }}>
          <IconButton className="float-right ml-2" iconName={IconTypes.Trash} removeBorder disabled={byte.steps.length === 1} onClick={() => {}} />
        </div>
        <div className="w-full mb-4">
          <Input>Name*</Input>
        </div>
        <div className="w-full mb-4">
          <InputWithButton buttonLabel={'Set Image'} inputLabel={'Image Url'} onButtonClick={() => {}} onInputUpdate={() => {}} inputModelValue={''} />
        </div>

        <MarkdownEditor
          id={''}
          modelValue={''}
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
