import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceLoadersInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertSpaceLoadersInfoModal';
import { Space, SpaceLoadersInfoInput, SpaceWithIntegrationsFragment, useUpsertSpaceLoaderInfoMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface SpaceAuthDetailsProps {
  space: Space;
  className?: string;
}

function getSpaceSocialFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Discourse Url',
      value: space.spaceIntegrations?.loadersInfo?.discourseUrl || 'Not Set',
    },
  ];
}

export default function SpaceLoadersInformation(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const [showUpsertSpaceLoadersInfoModal, setShowUpsertSpaceLoadersInfoModal] = useState(false);

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowUpsertSpaceLoadersInfoModal(true);
    }
  };
  const [upsertSpaceLoaderInfoMutation] = useUpsertSpaceLoaderInfoMutation({});

  const upsert = async (loaderInfos: SpaceLoadersInfoInput) => {
    await upsertSpaceLoaderInfoMutation({
      variables: {
        spaceId: props.space.id,
        input: loaderInfos,
      },
      refetchQueries: ['ExtendedSpace', 'ExtendedSpaceByDomain'],
    });
    setShowUpsertSpaceLoadersInfoModal(false);
  };

  return (
    <>
      <DetailsSection className={props.className}>
        <div className="flex w-full">
          <DetailsHeader header={'Space Loaders Information'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        {getSpaceSocialFields(props.space).map((field) => (
          <DetailsField key={field.label} label={field.label} value={field.value} />
        ))}
      </DetailsSection>
      <UpsertSpaceLoadersInfoModal
        onUpsert={upsert}
        open={showUpsertSpaceLoadersInfoModal}
        onClose={() => setShowUpsertSpaceLoadersInfoModal(false)}
        loadersInfo={props.space.spaceIntegrations?.loadersInfo || undefined}
      />
    </>
  );
}
