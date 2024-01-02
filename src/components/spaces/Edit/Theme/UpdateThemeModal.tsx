import { useNotificationContext } from '@/contexts/NotificationContext';
import { themes, ThemeValue } from '@/app/themes';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ProjectByteCollectionFragment, SpaceWithIntegrationsFragment, useUpdateThemeColorsMutation } from '@/graphql/generated/generated-types';
import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18 } from '@/hooks/useI18';

export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
  open: boolean;
  onClose: () => void;
  colorLabels: string[];
  byteCollection: ProjectByteCollectionFragment;
}

export default function UpdateThemeModal({ space, open, onClose, colorLabels, byteCollection }: UpdateThemeModalProps) {
  const [themeColors, setThemeColors] = useState<ThemeValue>(space.themeColors || themes.GlobalTheme);
  const themeColorKeys = Object.keys(themeColors) as (keyof ThemeValue)[];
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
        router.push(`/`);
      } else {
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
  }

  const handleColorChange = (colorKey: keyof ThemeValue, colorValue: string) => {
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

  return (
    <FullScreenModal open={open} onClose={onClose} title="Theme Settings">
      <div style={{ ...themeStyles }}>
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
            <div className="flex justify-center items-center w-full md:mt-0 md:w-1/2 p-2 md:p-4">
              <ByteCollectionsCard
                key={byteCollection.id}
                isEditingAllowed={false}
                byteCollection={byteCollection}
                onSelectByte={() => {}}
                baseByteCollectionsEditUrl={'TestUrl'}
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
      </div>
    </FullScreenModal>
  );
}
