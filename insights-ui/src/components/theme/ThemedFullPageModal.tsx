'use client';

import { usePortalTheme } from '@/components/theme/use-portal-theme';
import FullPageModal, { type SingleSectionModalProps } from '@dodao/web-core/components/core/modals/FullPageModal';

/**
 * `FullPageModal` that follows the app-wide light/dark theme. Use it for user-facing modals;
 * the plain `FullPageModal` always renders with the dark palette because it is portaled outside
 * the `ThemeProvider` wrapper.
 */
export default function ThemedFullPageModal({ className, ...props }: SingleSectionModalProps): JSX.Element {
  const themeClass = usePortalTheme();
  // FullPageModal falls back to `w-full` when no className is given, so keep that default when appending the theme class.
  const panelClassName = themeClass ? `${className || 'w-full'} ${themeClass}` : className;

  return <FullPageModal {...props} className={panelClassName} />;
}
