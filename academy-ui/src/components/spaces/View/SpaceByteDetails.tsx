import { ByteViewMode } from '@/types/bytes/ByteDto';
import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceByteSettingsModal from '@/components/spaces/Edit/Bytes/UpsertSpaceByteSettingsModal';
import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
  onUpdateSettings: () => Promise<void>;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Ask for Login to Submit',
      value: (!!space.byteSettings.askForLoginToSubmit).toString(),
    },
    {
      label: 'Capture Before and After Rating',
      value: (!!space.byteSettings.captureRating).toString(),
    },
    {
      label: 'Show Categories in Sidebar',
      value: (!!space.byteSettings.showCategoriesInSidebar).toString(),
    },
    {
      label: 'View Mode',
      value: (space.byteSettings?.byteViewMode === ByteViewMode.FullScreenSwiper ? 'Full Screen Swiper' : 'Card Stepper').toString(),
    },
  ];
}

export default function SpaceByteDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showByteSettingsModal, setShowByteSettingsModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowByteSettingsModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Byte Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceDetailsFields(props.space).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceByteSettingsModal
        space={props.space}
        open={showByteSettingsModal}
        onClose={() => setShowByteSettingsModal(false)}
        onUpdateSettings={props.onUpdateSettings}
      />
    </>
  );
}
