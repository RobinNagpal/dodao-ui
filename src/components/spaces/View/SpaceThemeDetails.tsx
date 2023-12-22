import { ThemeValue } from '@/app/themes';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpdateThemeModal from '@/components/spaces/Edit/Theme/UpdateThemeModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface SpaceDetailsProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
}

export default function SpaceThemeDetails({ space }: SpaceDetailsProps) {
  // Here you add logic to show color selected and the Tidbit Grid. This is the screenshot which you send.
  // This is VIEW ONLY MODE

  const [showThemeUpdateModal, setShowThemeUpdateModal] = React.useState(false);
  const threeDotItems = [
    { label: 'Reload Repo', key: 'reloadRepo' },
    { label: 'Edit', key: 'edit' },
  ];

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowThemeUpdateModal(true);
    }
  };
  return (
    <div>
      <div className="flex w-full">
        <div className="sm:flex-auto">
          <h1 className="font-semibold leading-6 text-2xl">Theme Details</h1>
          <p className="mt-2 text-sm">You can update your theme</p>
        </div>
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
      </div>
      <div>Here you add logic to show color selected and the Tidbit Grid. This is the screenshot which you send.</div>
      <div>This is view only mode. It show boxes instead of color input</div>
      <UpdateThemeModal space={space} open={showThemeUpdateModal} onClose={() => setShowThemeUpdateModal(false)} />
    </div>
  );
}
