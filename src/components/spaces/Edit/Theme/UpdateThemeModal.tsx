import { themes, ThemeValue } from '@/app/themes';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ProjectByteCollectionFragment, SpaceWithIntegrationsFragment, useUpdateThemeColorsMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
  open: boolean;
  onClose: () => void;
  colorLabels: string[];
}

export default function UpdateThemeModal({ space, open, onClose, colorLabels }: UpdateThemeModalProps) {
  const [themeColors, setThemeColors] = useState<ThemeValue>(space.themeColors || themes.GlobalTheme);
  const themeColorKeys = Object.keys(themeColors) as (keyof ThemeValue)[];

  const [updateThemeColorsMutation] = useUpdateThemeColorsMutation();

  async function upsertThemeColors() {
    await updateThemeColorsMutation({
      variables: {
        spaceId: space.id,
        themeColors: {
          bgColor: themeColors.bgColor,
          textColor: themeColors.textColor,
          blockBg: themeColors.blockBg,
          borderColor: themeColors.borderColor,
          primaryColor: themeColors.primaryColor,
          headingColor: themeColors.headingColor,
          linkColor: themeColors.linkColor,
        },
      },
    });
  }

  const handleColorChange = (colorKey: keyof ThemeValue, colorValue: string) => {
    setThemeColors({ ...themeColors, [colorKey]: colorValue });
  };

  const byteCollection: ProjectByteCollectionFragment = {
    id: 'b757246b-1b08-42ce-a8cb-a9ce19bc78b3',
    name: 'About DEX',
    description: 'This collection of Tidbits explains different exchange models and the benefits of AMM',
    status: 'DRAFT',
    byteIds: ['centralized-vs-decentralized-exchange-uniswap', 'amm-benefits-uniswap'],
    order: 100,
    bytes: [
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'amm-benefits-uniswap',
        name: 'AMM Benefits',
        content: 'Benefits of Automated Market Maker over Order Book',
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        __typename: 'ByteCollectionByte',
      },
    ],
    __typename: 'ProjectByteCollection',
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title="Theme Settings">
      <div className="mt-4">
        <div className="flex flex-col md:flex-row flex-wrap">
          <div className="w-full md:w-1/2 mt-4">
            <h1 className="font-bold text-2xl mb-4">Theme Details</h1>
            {colorLabels.map((label, index) => {
              const colorKey = themeColorKeys[index];
              const colorValue = themeColors[colorKey] || '';
              return (
                <div key={index} className="flex justify-between items-center mb-2">
                  <label className="ml-7">{label}</label>
                  <input type="color" className="w-12 h-8 mr-8" value={colorValue} onChange={(e) => handleColorChange(colorKey, e.target.value)} />
                </div>
              );
            })}
          </div>
          <div
            className="flex justify-center items-center w-full md:mt-0 md:w-1/2 p-2 md:p-4"
            style={{
              color: themeColors.textColor,
            }}
          >
            <ByteCollectionsCard
              key={byteCollection.id}
              isEditingAllowed={false}
              byteCollection={byteCollection}
              onSelectByte={() => {}}
              baseByteCollectionsEditUrl={'TestUrl'}
              iconBgColor={themeColors.primaryColor}
              cardBgColor={themeColors.bgColor}
              cardHeadingColor={themeColors.headingColor}
              cardBorderColor={themeColors.borderColor}
            />
          </div>
        </div>
      </div>
      <div className="p-6 mt-4 flex items-center justify-center gap-x-6">
        <Button
          variant="contained"
          primary
          // loading={}
          // disabled={uploadThumbnailLoading || upserting}
          onClick={upsertThemeColors}
        >
          Save
        </Button>
      </div>
    </FullScreenModal>
  );
}
