import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import UpdateThemeModal, { ColorLabels, ThemeColorsKeys } from '@/components/spaces/Edit/Theme/UpdateThemeModal';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto, ThemeColorsDto } from '@/types/space/SpaceDto';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import React from 'react';

export interface SpaceDetailsProps {
  space: SpaceWithIntegrationsDto;
}

export default function SpaceThemeDetails({ space }: SpaceDetailsProps) {
  const [showThemeUpdateModal, setShowThemeUpdateModal] = React.useState(false);

  const themeColors: ThemeColorsDto = space?.themeColors || GlobalThemeColors;

  const threeDotItems = [
    { label: 'Reload Repo', key: 'reloadRepo' },
    { label: 'Edit', key: 'edit' },
  ];

  const selectFromThreedotDropdown = async (e: string) => {
    if (e === 'edit') {
      setShowThemeUpdateModal(true);
    }
  };

  const byteCollection: ByteCollectionSummary = {
    id: 'b757246b-1b08-42ce-a8cb-a9ce19bc78b3',
    name: 'About DEX',
    description: 'This collection of Tidbits explains different exchange models and the benefits of AMM',
    archive: false,
    byteIds: ['centralized-vs-decentralized-exchange-uniswap', 'amm-benefits-uniswap'],
    order: 50,
    bytes: [
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_1',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
      },
      {
        byteId: 'amm-benefits-uniswap',
        name: 'AMM Benefits',
        content: 'Benefits of Automated Market Maker over Order Book',
        archive: false,
      },
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_2',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
      },
    ],
    demos: [],
    shorts: [],
    items: [],
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full">
        <div className="md:flex-auto">
          <h1 className="font-semibold leading-6 text-lg md:text-2xl">Theme Details</h1>
          <p className="mt-2 text-sm md:text-base">You can update your theme</p>
        </div>
        <PrivateEllipsisDropdown space={props.space} items={threeDotItems} onSelect={selectFromThreedotDropdown} className="ml-4 pt-4 grow-0 w-16" />
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
            <ByteCollectionsCard byteCollection={byteCollection} isEditingAllowed={false} viewByteBaseUrl={'/'} space={space} showItemTypeBadge={true} />
          </div>
        </div>
      </div>
      {showThemeUpdateModal && (
        <UpdateThemeModal byteCollection={byteCollection} space={space} open={showThemeUpdateModal} onClose={() => setShowThemeUpdateModal(false)} />
      )}
    </div>
  );
}
