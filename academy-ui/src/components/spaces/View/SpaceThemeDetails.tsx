import { CssTheme, ThemeKey, ThemeValue, themes } from '@dodao/web-core/src/components/app/themes';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpdateThemeModal, { ColorLabels, ThemeColorsKeys } from '@/components/spaces/Edit/Theme/UpdateThemeModal';
import { ByteCollectionFragment, SpaceWithIntegrationsFragment, ThemeColors } from '@/graphql/generated/generated-types';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import React from 'react';

export interface SpaceDetailsProps {
  space: SpaceWithIntegrationsFragment;
}

export default function SpaceThemeDetails({ space }: SpaceDetailsProps) {
  const [showThemeUpdateModal, setShowThemeUpdateModal] = React.useState(false);
  const skin = space?.skin;

  const theme: ThemeKey = space?.skin && Object.keys(CssTheme).includes(skin || '') ? (skin as CssTheme) : CssTheme.GlobalTheme;
  const themeColors: ThemeColors = space?.themeColors || themes[theme];

  const threeDotItems = [
    { label: 'Reload Repo', key: 'reloadRepo' },
    { label: 'Edit', key: 'edit' },
  ];

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowThemeUpdateModal(true);
    }
  };

  const byteCollection: ByteCollectionFragment = {
    id: 'b757246b-1b08-42ce-a8cb-a9ce19bc78b3',
    name: 'About DEX',
    description: 'This collection of Tidbits explains different exchange models and the benefits of AMM',
    status: 'DRAFT',
    byteIds: ['centralized-vs-decentralized-exchange-uniswap', 'amm-benefits-uniswap'],
    priority: 50,
    bytes: [
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_1',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'amm-benefits-uniswap',
        name: 'AMM Benefits',
        content: 'Benefits of Automated Market Maker over Order Book',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_2',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
    ],
    demos: [],
    shorts: [],
    __typename: 'ByteCollection',
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full">
        <div className="md:flex-auto">
          <h1 className="font-semibold leading-6 text-lg md:text-2xl">Theme Details</h1>
          <p className="mt-2 text-sm md:text-base">You can update your theme</p>
        </div>
        <PrivateEllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
      </div>

      <div className={'mt-4'}>
        <div className="flex flex-col md:flex-row flex-wrap">
          <div className="w-full md:w-1/2 mt-4">
            {Object.entries(ColorLabels).map((e) => {
              const [colorKey, label] = e as [ThemeColorsKeys, string];
              const colorValue = themeColors[colorKey];
              return (
                <div key={colorKey} className="flex justify-between mb-2">
                  <label className="ml-7">{label}</label>
                  <div className="grid grid-cols-2	">
                    <input type="color" className="w-12 h-8 mr-8" value={colorValue} disabled />
                    <div>{colorValue}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full md:mt-0 mt-4 md:w-1/2 p-2 md:p-4">
            <ByteCollectionsCard byteCollection={byteCollection} isEditingAllowed={false} viewByteBaseUrl={'/'} space={space} />
          </div>
        </div>
      </div>
      {showThemeUpdateModal && (
        <UpdateThemeModal byteCollection={byteCollection} space={space} open={showThemeUpdateModal} onClose={() => setShowThemeUpdateModal(false)} />
      )}
    </div>
  );
}
