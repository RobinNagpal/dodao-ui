import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import { ThemeColors } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto, ThemeColorsDto } from '@/types/space/SpaceDto';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { CSSProperties, useState } from 'react';

export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsDto;
  open: boolean;
  onClose: () => void;
  byteCollection: ByteCollectionSummary;
}

export type ThemeColorsKeys = 'bgColor' | 'blockBg' | 'borderColor' | 'headingColor' | 'linkColor' | 'primaryColor' | 'textColor';

export const ColorLabels: Record<ThemeColorsKeys, string> = {
  primaryColor: 'Primary Color',
  bgColor: 'Background Color',
  textColor: 'Text Color',
  linkColor: 'Link Color',
  headingColor: 'Heading Color',
  borderColor: 'Border Color',
  blockBg: 'Block Background Color',
};

export default function UpdateThemeModal({ space, open, onClose, byteCollection }: UpdateThemeModalProps) {
  const [themeColors, setThemeColors] = useState<ThemeColors>(space?.themeColors || GlobalThemeColors);

  const { updateData: putData } = useUpdateData<SpaceWithIntegrationsDto, { spaceId: string; themeColors: ThemeColorsDto }>(
    {},
    {
      successMessage: 'Theme Updated',
      errorMessage: 'Error updating theme colors',
    }
  , 'PUT');

  async function upsertThemeColors() {
    await putData(
      `${getBaseUrl()}/api/${space.id}/actions/spaces/update-theme-colors`,
      {
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
      }
    );
    // reload the page to reflect the changes
    window.location.reload();
  }

  const handleColorChange = (colorKey: ThemeColorsKeys, colorValue: string) => {
    setThemeColors({ ...themeColors, [colorKey]: colorValue });
  };

  const handleColorInputChange = (colorKey: ThemeColorsKeys, colorValue: string) => {
    // Ensure that colorValue starts with '#'
    if (!colorValue.startsWith('#')) {
      colorValue = '#' + colorValue;
    }
    // Validate that colorValue is a valid hex color or incomplete input
    if (/^#([0-9A-Fa-f]{0,6})$/.test(colorValue)) {
      setThemeColors({ ...themeColors, [colorKey]: colorValue });
    }
  };

  const themeStyles = {
    '--primary-color': themeColors.primaryColor,
    '--bg-color': themeColors.bgColor,
    '--text-color': themeColors.textColor,
    '--link-color': themeColors.linkColor,
    '--heading-color': themeColors.headingColor,
    '--border-color': themeColors.borderColor,
    '--block-bg': themeColors.blockBg,
  } as CSSProperties;

  console.log('themeStyles', themeStyles);
  return (
    <FullScreenModal open={open} onClose={onClose} title="Theme Settings">
      <PageWrapper>
        <div style={{ ...themeStyles }}>
          <div className="mt-4">
            <div className="flex flex-col md:flex-row flex-wrap">
              <div className="w-full md:w-1/2 mt-4">
                <h1 style={{ color: 'var(--heading-color)' }} className="font-bold text-2xl mb-4">
                  Theme Details
                </h1>
                {Object.entries(ColorLabels).map(([colorKey, label]) => {
                  const key = colorKey as ThemeColorsKeys;
                  const colorValue = themeColors[key];
                  return (
                    <div style={{ color: 'var(--text-color)' }} key={key} className="flex justify-between mb-2">
                      <label className="ml-7">{label}</label>
                      <div className="flex items-center">
                        <input type="color" className="w-12 h-8 mr-4" value={colorValue} onChange={(e) => handleColorChange(key, e.target.value)} />
                        <input
                          className="w-24 p-1 border border-gray-300 rounded text-color background-color"
                          value={colorValue}
                          onChange={(e) => handleColorInputChange(key, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center items-center w-full md:mt-0 md:w-1/2 p-2 md:p-4">
                <ByteCollectionsCard isEditingAllowed={false} byteCollection={byteCollection} viewByteBaseUrl={'/'} space={space} />
              </div>
            </div>
          </div>
          <div className="p-6 mt-4 flex items-center justify-center gap-x-6">
            <Button variant="contained" primary onClick={upsertThemeColors}>
              Save
            </Button>
          </div>
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
}
