'use client';

import Block from '@/components/app/Block';
import UserInput from '@/components/app/Form/UserInput';
import AddGuideCategoryModal from '@/components/app/Modal/AddGuideCategoryModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import { EditGuideStepper } from '@/components/guides/Edit/EditGuideStepper';
import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { UseEditGuideHelper } from '@/components/guides/Edit/useEditGuide';
import { Space } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { GuideCategoryType, PublishStatus } from '@/types/deprecated/models/enums';
import { publishStatusesSelect } from '@/utils/ui/statuses';
import React, { useState } from 'react';

type BasicGuideSettingsProps = {
  space: Space;
  guide: EditGuideType;
  guideErrors: Record<string, any>;
  editGuideHelper: UseEditGuideHelper;
};

export default function BasicGuideSettings({ editGuideHelper, guide, guideErrors, space }: BasicGuideSettingsProps) {
  const selectPublishStatus = (status: PublishStatus) => {
    editGuideHelper.updateGuideFunctions.updateGuideField('publishStatus', status);
  };
  const { $t } = useI18();
  const { updateGuideField } = editGuideHelper.updateGuideFunctions;

  const [guideCategoryModal, setGuideCategoryModal] = useState(false);

  function handleGuideCategoryInputs(value: GuideCategoryType[]) {
    updateGuideField('categories', value);
  }

  function handleClose() {
    setGuideCategoryModal(false);
  }

  return (
    <div>
      {/* Basic Info Section */}
      <Block title={$t('guide.create.basicInfo')} className="mt-4 font-bold text-xl">
        <div className="mt-4 flex flex-col gap-5">
          <UserInput modelValue={guide.name} setUserInput={(v) => updateGuideField('name', v.toString())} label="Name" required></UserInput>

          <UserInput modelValue={guide.content} setUserInput={(v) => updateGuideField('content', v.toString())} label={'One line description'} required />

          <StyledSelect
            label="Publish Status *"
            selectedItemId={guide.publishStatus || 'Live'}
            items={publishStatusesSelect}
            setSelectedItemId={(value) => selectPublishStatus(value as PublishStatus)}
          />
        </div>
      </Block>

      {/* Step By Step Section */}
      {guide && (
        <Block title={$t('guide.create.stepByStep')} slim>
          <div className="mt-4">
            <EditGuideStepper guide={guide} guideErrors={guideErrors} space={space} editGuideHelper={editGuideHelper} />
          </div>
        </Block>
      )}

      {/* Error Section */}
      {Object.values(guideErrors).filter((v) => !!v).length > 0 && (
        <div className="!text-red flex text-center justify-center mb-2 align-baseline">
          <i className="iconfont iconwarning !text-red"></i>
          <span className="ml-1">Fix errors to proceed. Make sure you have selected a correct answer for each question</span>
        </div>
      )}

      {guideCategoryModal && <AddGuideCategoryModal open={guideCategoryModal} onClose={handleClose} onAddInput={handleGuideCategoryInputs} />}
    </div>
  );
}
