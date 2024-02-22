import DetailsRow, { DetailsFieldProps } from '@/components/core/details/DetailsRow';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpsertSpaceAuthSettingsModal from '@/components/spaces/Edit/Auth/UpsertSpaceAuthSettingsModal';
import {
  Space,
  SpaceWithIntegrationsFragment,
  useRoute53RecordQuery,
  useUpsertDomainRecordsMutation,
  useVercelDomainRecordQuery,
} from '@/graphql/generated/generated-types';
import React, { ReactElement, useState } from 'react';

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

function DomainDetailRows({ space }: { space: SpaceWithIntegrationsFragment }): ReactElement<DetailsFieldProps> {
  return <></>;
}
export default function SpaceDomaiDetails(props: SpaceAuthDetailsProps) {
  const threeDotItems = [{ label: 'Create Domain Records', key: 'create-domain-records' }];
  const [showAuthSettingsModal, setShowAuthSettingsModal] = useState(false);

  const [upsertDomainRecords] = useUpsertDomainRecordsMutation();
  const { data: route53Response } = useRoute53RecordQuery({ variables: { spaceId: props.space.id } });
  const { data: vercelDomainResponse } = useVercelDomainRecordQuery({ variables: { spaceId: props.space.id } });

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'create-domain-records') {
      await upsertDomainRecords({
        variables: {
          spaceId: props.space.id,
        },
      });
    }
  };

  return (
    <>
      <DetailsSection className={`${props.className} shadow`}>
        <div className="flex w-full">
          <DetailsHeader header={'Auth Details'} className="grow-1 w-full" />
          <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
        </div>
        <DetailsRow label={'Route 53 Record'} value={JSON.stringify(route53Response?.payload || {})} />
        <DetailsRow
          label={'Vercel Domain Record'}
          value={vercelDomainResponse?.vercelDomainRecord ? JSON.stringify(vercelDomainResponse?.vercelDomainRecord) : 'No Vercel Domain Record'}
        />
      </DetailsSection>
      <UpsertSpaceAuthSettingsModal space={props.space} open={showAuthSettingsModal} onClose={() => setShowAuthSettingsModal(false)} />
    </>
  );
}
