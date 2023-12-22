import { themes, ThemeValue } from '@/app/themes';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { CSSProperties, useState } from 'react';
import styles from './UpdateThemeModal.module.scss';
export interface UpdateThemeModalProps {
  space: SpaceWithIntegrationsFragment & { themeColors?: ThemeValue };
  open: boolean;
  onClose: () => void;
}

export default function UpdateThemeModal({ space, open, onClose }: UpdateThemeModalProps) {
  const [themeColors, setThemeColors] = useState<ThemeValue>(space.themeColors || themes.ArbitrumTheme);

  const style = {
    '--primary-color': themeColors.primaryColor,
    '--bg-color': themeColors.bgColor,
    '--text-color': themeColors.textColor,
    '--link-color': themeColors.linkColor,
    '--heading-color': themeColors.headingColor,
    '--border-color': themeColors.borderColor,
    '--block-bg': themeColors.blockBg,
  } as CSSProperties;

  // Here you add logic to show color selector and the Tidbit Grid. This is the screenshot which you send.
  // This is EDIT MODE
  return (
    <FullScreenModal open={open} onClose={onClose} title="Basic Space Settings">
      <div style={style} className={styles.bodyText}>
        <div>Here you add logic to show color selector and the Tidbit Grid. This is the screenshot which you send.</div>
        <div>
          <label htmlFor="hs-color-input" className="block text-sm font-medium mb-2 dark:text-white">
            Color picker
          </label>
          <input
            type="color"
            className="p-1 h-10 block bg-white border border-gray-200 cursor-pointer w-10 rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
            id="hs-color-input"
            value={themeColors.textColor}
            title="Choose your color"
            onChange={(e) => {
              setThemeColors({ ...themeColors, primaryColor: e.target.value });
            }}
          />
          - {themeColors.textColor}
        </div>
      </div>
    </FullScreenModal>
  );
}
