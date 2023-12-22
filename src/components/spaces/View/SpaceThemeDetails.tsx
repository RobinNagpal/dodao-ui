import { ThemeValue, themes } from '@/app/themes';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpdateThemeModal from '@/components/spaces/Edit/Theme/UpdateThemeModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface SpaceDetailsProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
}

export default function SpaceThemeDetails({ space }: SpaceDetailsProps) {
  const [showThemeUpdateModal, setShowThemeUpdateModal] = React.useState(false);

  const [themeColors, setThemeColors] = useState<ThemeValue>(space.themeColors || themes.GlobalTheme);
  const themeColorKeys = Object.keys(themeColors) as (keyof ThemeValue)[];

  const threeDotItems = [
    { label: 'Reload Repo', key: 'reloadRepo' },
    { label: 'Edit', key: 'edit' },
  ];

  const colorLabels = ['Primary Color', 'Background Color', 'Text Color', 'Link Color', 'Heading Color', 'Border Color', 'Block Color'];

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

      <div className={'mt-4 '}>
        <div className="flex flex-wrap">
          <div className="w-1/2 mt-4">
            {colorLabels.map((label, index) => {
              const colorKey = themeColorKeys[index];
              const colorValue = themeColors[colorKey] || '';
              console.log('i am ali ' + colorValue);
              return (
                <div key={index} className="flex justify-between items-center mb-2">
                  <label className="ml-7">{label}</label>
                  <input type="color" className="w-12 h-8 mr-8" value={colorValue} disabled />
                </div>
              );
            })}
          </div>
          <div className="w-1/2 p-4 border">
            <h1 className="text-2xl text-center">Test Heading</h1>

            <p>
              This is a sample text Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rerum voluptas eaque illo nesciunt perspiciatis accusantium
              tenetur unde quo exercitationem, molestias error est neque recusandae. Similique sequi, fuga commodi ipsum repellat quisquam cupiditate dolor cum
              possimus odio accusantium nam facere corrupti aliquam inventore est soluta id asperiores dicta temporibus optio. Earum, porro reiciendis quidem
              nam laudantium dolores, ullam quis enim tempore consequatur, doloremque sed! Suscipit reiciendis officia mollitia adipisci vel velit fugiat,
              explicabo corrupti voluptatum necessitatibus, debitis commodi laborum numquam, exercitationem ipsum sed. Obcaecati quasi quo error placeat
              repellat assumenda, autem voluptas porro expedita illum excepturi aspernatur ex earum corrupti perspiciatis.
            </p>
          </div>
        </div>
      </div>
      <UpdateThemeModal colorLabels={colorLabels} space={space} open={showThemeUpdateModal} onClose={() => setShowThemeUpdateModal(false)} />
    </div>
  );
}
