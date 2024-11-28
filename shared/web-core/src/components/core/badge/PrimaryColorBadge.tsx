import { PropsWithChildren } from 'react';
import styles from './PrimaryBadge.module.scss';

export default function PrimaryColorBadge({ children, onClick }: PropsWithChildren<{}> & { onClick?: () => void }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl px-2 py-1 mr-2 text-xs font-medium max-h-6 text-nowrap whitespace-nowrap ${styles.primaryBadge} ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
