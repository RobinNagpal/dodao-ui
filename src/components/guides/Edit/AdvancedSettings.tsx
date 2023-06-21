import Block from '@/components/app/Block';
import StyledSelect, { StyledSelectItem } from '@/components/core/select/StyledSelect';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { UpdateGuideFunctions } from '@/components/guides/Edit/useEditGuide';
import { Space } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { GuideError } from '@/types/errors/error';
import React from 'react';

interface Props {
  guide: EditGuideType;
  guideErrors: GuideError;
  space: Space;
  updateGuideFunctions: UpdateGuideFunctions;
}

export default function AdvancedSettings(props: Props) {
  const { $t } = useI18();
  const showIncorrectChoices: StyledSelectItem[] = [
    {
      label: 'Yes',
      id: 'true',
    },
    {
      label: 'No',
      id: 'false',
    },
  ];

  return (
    <div>
      <Block title={$t('guide.create.advancedInfo')} className="mt-4 wrapper">
        <StyledSelect
          label={'Show Incorrect Questions'}
          selectedItemId={props.guide.showIncorrectOnCompletion?.toString() || 'true'}
          items={showIncorrectChoices}
          setSelectedItemId={(v) => props.updateGuideFunctions.updateGuideField('showIncorrectOnCompletion', v === 'true')}
          className="mb-4"
        />
        <TextareaAutosize
          label={$t(`guide.postSubmissionStepContent`)}
          id="postSubmissionStepContent"
          modelValue={props.guide.postSubmissionStepContent || ''}
          placeholder={$t(`guide.postSubmissionStepContent`)}
          className="input w-full text-left"
          onUpdate={(v) => props.updateGuideFunctions.updateGuideField('postSubmissionStepContent', v?.toString() || '')}
        />
      </Block>
    </div>
  );
}
