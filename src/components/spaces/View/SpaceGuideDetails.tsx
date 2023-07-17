import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceGuideSettingsModal from '@/components/spaces/Edit/Guides/UpsertSpaceGuideSettingsModal';
import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Ask for Login to Submit',
      value: (!!space.guideSettings.askForLoginToSubmit).toString(),
    },
    {
      label: 'Capture Before and After Rating',
      value: (!!space.guideSettings.captureBeforeAndAfterRating).toString(),
    },
    {
      label: 'Show Categories in Sidebar',
      value: (!!space.guideSettings.showCategoriesInSidebar).toString(),
    },
    {
      label: 'Show Incorrect After Each Step',
      value: (!!space.guideSettings.showIncorrectAfterEachStep).toString(),
    },
    {
      label: 'Show Incorrect on Completion',
      value: (!!space.guideSettings.showIncorrectOnCompletion).toString(),
    },
  ];
}

export default function SpaceGuideDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showGuideSettingsModal, setShowGuideSettingsModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowGuideSettingsModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Guide Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceDetailsFields(props.space).map((field) => (
          <DetailsField key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceGuideSettingsModal space={props.space} open={showGuideSettingsModal} onClose={() => setShowGuideSettingsModal(false)} />
    </>
  );
}
