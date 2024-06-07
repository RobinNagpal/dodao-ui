import Block from '@dodao/web-core/components/app/Block';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { UpdateGuideFunctions } from '@/components/guides/Edit/useEditGuide';
import { Space } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { GuideError } from '@dodao/web-core/types/errors/error';
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
      <Block title="Project Galaxy Settings" className="mt-4 wrapper">
        <Input
          modelValue={props.guide.guideIntegrations.projectGalaxyCredentialId}
          onUpdate={(v) => props.updateGuideFunctions.updateGuideIntegrationField('projectGalaxyCredentialId', v?.toString() || '')}
          label={'Project Galaxy Credential ID'}
        />
        <Input
          modelValue={props.guide.guideIntegrations.projectGalaxyOatMintUrl}
          onUpdate={(v) => props.updateGuideFunctions.updateGuideIntegrationField('projectGalaxyOatMintUrl', v?.toString() || '')}
          label={'Project Galaxy OAT/NFT Mint URL'}
        />
        <Input
          modelValue={props.guide.guideIntegrations.projectGalaxyOatPassingCount}
          onUpdate={(v) => props.updateGuideFunctions.updateGuideIntegrationField('projectGalaxyOatPassingCount', v ? parseInt(v.toString()) : null)}
          label={'Project Galaxy Passing Count'}
          number
        />
      </Block>
      <Block title="Other Settings" className="mt-4 wrapper">
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
