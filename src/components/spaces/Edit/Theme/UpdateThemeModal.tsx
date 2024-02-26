import { CssTheme, ThemeKey, themes } from '@/app/themes';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ProjectByteCollectionFragment, SpaceWithIntegrationsFragment, ThemeColors, useUpdateThemeColorsMutation } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { useRouter } from 'next/navigation';
import React, { CSSProperties, useState } from 'react';

export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsFragment;
  open: boolean;
  onClose: () => void;
  byteCollection: ProjectByteCollectionFragment;
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
  const skin = space?.skin;
  const theme: ThemeKey = space?.skin && Object.keys(CssTheme).includes(skin || '') ? (skin as CssTheme) : CssTheme.GlobalTheme;
  const [themeColors, setThemeColors] = useState<ThemeColors>(space?.themeColors || themes[theme]);
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const { $t } = useI18();
  const [updateThemeColorsMutation] = useUpdateThemeColorsMutation();

  async function upsertThemeColors() {
    try {
      const response = await updateThemeColorsMutation({
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

      if (!response.errors) {
        showNotification({
          type: 'success',
          message: 'Theme Updated',
          heading: 'Success 🎉',
        });
        location.reload();
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
  }

  const handleColorChange = (colorKey: ThemeColorsKeys, colorValue: string) => {
    setThemeColors({ ...themeColors, [colorKey]: colorValue });
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
      <div style={{ ...themeStyles }}>
        <div className="mt-4">
          <div className="flex flex-col md:flex-row flex-wrap">
            <div className="w-full md:w-1/2 mt-4">
              <h1 className="font-bold text-2xl mb-4">Theme Details</h1>
              {Object.entries(ColorLabels).map((e) => {
                const [colorKey, label] = e as [ThemeColorsKeys, string];
                const colorValue = themeColors[colorKey];
                return (
                  <div key={colorKey} className="flex justify-between mb-2">
                    <label className="ml-7">{label}</label>
                    <div className="grid grid-cols-2	">
                      <input type="color" className="w-12 h-8 mr-8" value={colorValue} onChange={(e) => handleColorChange(colorKey, e.target.value)} />
                      <div>{colorValue}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center items-center w-full md:mt-0 md:w-1/2 p-2 md:p-4">
              <ByteCollectionsCard space={space} isEditingAllowed={false} byteCollection={byteCollection} byteCollectionType={'projectByteCollection'} />
            </div>
          </div>
        </div>
        <div className="p-6 mt-4 flex items-center justify-center gap-x-6">
          <Button variant="contained" primary onClick={upsertThemeColors}>
            Save
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
