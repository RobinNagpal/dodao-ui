import { themes, ThemeValue } from '@/app/themes';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { CSSProperties, useState } from 'react';
import styles from './UpdateThemeModal.module.scss';

export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
  open: boolean;
  onClose: () => void;
  colorLabels: string[];
}

export default function UpdateThemeModal({ space, open, onClose, colorLabels }: UpdateThemeModalProps) {
  const [themeColors, setThemeColors] = useState<ThemeValue>(space.themeColors || themes.GlobalTheme);
  const themeColorKeys = Object.keys(themeColors) as (keyof ThemeValue)[];

  const handleColorChange = (colorKey: keyof ThemeValue, colorValue: string) => {
    setThemeColors({ ...themeColors, [colorKey]: colorValue });
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title="Theme Settings">
      <div className={'mt-4 ' + styles.bodyText}>
        <div className="flex flex-wrap">
          <div className="w-1/2">
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
            className="w-1/2 p-4"
            style={{
              color: themeColors.textColor,
              backgroundColor: themeColors.bgColor,
              border: '3px solid ' + themeColors.borderColor,
            }}
          >
            <h1
              className="text-2xl text-center"
              style={{
                color: themeColors.headingColor,
              }}
            >
              Test Heading
            </h1>

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
    </FullScreenModal>
  );
}
