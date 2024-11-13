import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpdateTidbitsHomepageModal from '@/components/spaces/Edit/TidbitsHomepage/UpdateTidbitsHomepageModal';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DetailsHeader from '@dodao/web-core/components/core/details/DetailsHeader';
import DetailsRow from '@dodao/web-core/components/core/details/DetailsRow';
import DetailsSection from '@dodao/web-core/components/core/details/DetailsSection';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: SpaceWithIntegrationsDto;
  className?: string;
}

function getSpaceTidbitsHomepageFields(space: SpaceWithIntegrationsDto): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Heading',
      value: space.tidbitsHomepage?.heading || 'Not Set',
    },
    {
      label: 'Short Description',
      value: space.tidbitsHomepage?.shortDescription || 'Not Set',
    },
  ];
}

export default function SpaceTidbitsHomepageDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showTidbitsHomepageModal, setShowTidbitsHomepageModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowTidbitsHomepageModal(true);
    }
  };

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'Tidbits Homepage Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceTidbitsHomepageFields(props.space).map((field) => (
          <DetailsRow key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpdateTidbitsHomepageModal space={props.space} open={showTidbitsHomepageModal} onClose={() => setShowTidbitsHomepageModal(false)} />
    </>
  );
}
