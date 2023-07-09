import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'EnableLogin',
      value: (!!space.authSettings.enableLogin).toString(),
    },
    {
      label: 'Allowed Login',
      value: space.authSettings.loginOptions?.join(', ') || 'All',
    },
  ];
}

export default function SpaceAuthDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  const selectFromThreedotDropdown = async (e: string) => {};

  return (
    <DetailsSection className={props.className}>
      <div className="flex w-full">
        <DetailsHeader header={'Auth Details'} subheader={'How login and other things are configured'} className="grow-1 w-full" />
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
      </div>
      {getSpaceDetailsFields(props.space).map((field) => (
        <DetailsField key={field.label} label={field.label} value={field.value} />
      ))}
    </DetailsSection>
  );
}
