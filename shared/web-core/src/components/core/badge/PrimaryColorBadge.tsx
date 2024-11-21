import { PropsWithChildren } from 'react';
import styles from './PrimaryBadge.module.scss';

export default function PrimaryColorBadge({ children }: PropsWithChildren<{}>) {
  return (
    <span className={`inline-flex items-center rounded-md ${styles.primaryBg} px-2 py-1 text-xs font-medium ${styles.primaryText} ${styles.primaryRing}`}>
      {children}
    </span>
  );
}
