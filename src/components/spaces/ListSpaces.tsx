import Button from '@/components/core/buttons/Button';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import UpsertSpaceBasicSettingsModal from '@/components/spaces/Edit/Basic/UpsertSpaceBasicSettingsModal';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { SpaceSummaryFragment, useSpacesQuery } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const MainDiv = styled.div`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

function getSpaceTableRows(spaceList?: SpaceSummaryFragment[]): TableRow[] {
  return (spaceList || []).map(
    (space): TableRow => ({
      id: space.id,
      columns: [space.name, space.id, space.skin, space.admins.join(', ')],
      item: space,
    }),
  );
}

export default function ListSpaces() {
  const { data } = useSpacesQuery();
  const [showSpaceAddModal, setShowSpaceAddModal] = useState(false);
  const router = useRouter();
  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
        },
      ],
      onSelect: async (key: string, space: SpaceSummaryFragment) => {
        if (key === 'view') {
          router.push(`/space/manage/${ManageSpaceSubviews.ViewSpace}/${space.id}`);
        }
      },
    };
  }, []);

  return (
    <MainDiv className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="font-semibold leading-6 text-2xl">Spaces</h1>
          <p className="mt-2 text-sm">A list of all the spaces.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button variant="contained" primary onClick={() => setShowSpaceAddModal(true)}>
            Add Space
          </Button>
        </div>
      </div>
      <Table
        data={getSpaceTableRows(data?.spaces || [])}
        columnsHeadings={['Name', 'Id', 'Skin', 'Admins']}
        columnsWidthPercents={[20, 20, 20, 20]}
        actions={tableActions}
      />
      <UpsertSpaceBasicSettingsModal open={showSpaceAddModal} onClose={() => setShowSpaceAddModal(false)} />
    </MainDiv>
  );
}
