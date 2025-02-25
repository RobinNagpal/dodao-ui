// LoadingSpinner.tsx

import React from 'react';
import styles from './LoadingSpinner.module.scss';
import { Spinner } from '@dodao/web-core/components/core/icons/Spinner';

export interface UiLoadingProps {
  fillWhite?: boolean;
  big?: boolean;
  overlay?: boolean;
  /** When true, the spinner uses the primary text color (var(--primary-text-color)) */
  primary?: boolean;
  className?: string;
}

export default function LoadingSpinner({ fillWhite = false, big = false, overlay = false, primary = false, className }: UiLoadingProps) {
  const spinnerClassName = [
    styles.loadingSpinner,
    big ? styles.big : '',
    overlay ? styles.overlay : '',
    primary ? styles.primary : '',
    fillWhite ? styles.fillWhite : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={spinnerClassName}>
      <Spinner />
    </span>
  );
}
