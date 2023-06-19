import Block from '@/components/app/Block';
import StyledSelect, { StyledSelectItem } from '@/components/core/select/StyledSelect';
import StyledTextareaAutosize from '@/components/core/textarea/StyledTextareaAutosize';
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

export default function AdvancedGuideInfo(props: Props) {
  // Implement all other function, component renderings, and hooks similar to the above

  // This is only a partial conversion. The rest of the component would follow this pattern.
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
      <Block title="guide.create.advancedInfo" className="mt-4 wrapper">
        <div className="show-incorrect-wrapper pt-3 border-b border-current">
          <StyledSelect
            selectedItemId={props.guide.showIncorrectOnCompletion?.toString() || 'true'}
            items={showIncorrectChoices}
            setSelectedItemId={() => {}}
          />

          <div className="input-label text-color mr-2 whitespace-nowrap absolute transform -translate-y-11 text-xs transition-transform duration-100 linear transition-font-size duration-100 linear">
            Show Incorrect Questions*
          </div>
        </div>
      </Block>
      <Block title="guide.postSubmissionStepContent" className="mt-4 wrapper">
        <StyledTextareaAutosize
          modelValue={props.guide.postSubmissionStepContent || ''}
          placeholder={$t(`guide.postSubmissionStepContent`)}
          className="input w-full text-left"
          onUpdate={(v) => {}}
        />
      </Block>
    </div>
  );
}
