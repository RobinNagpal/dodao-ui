import { PropsWithChildren } from 'react';
import styles from './PrimaryBadge.module.scss';

export default function PrimaryColorBadge({
  children,
  onClick,
  className,
  highlighted,
}: PropsWithChildren<{}> & { onClick?: () => void; className?: string; highlighted?: boolean }) {
  const defaultStyles = `inline-flex items-center rounded-xl px-2 py-1 mr-2 text-xs font-medium max-h-6 text-nowrap whitespace-nowrap`;
  const cursorStyles = onClick ? 'cursor-pointer' : 'cursor-default';
  const highlightedClass = highlighted ? styles.highlightedBadge : '';
  return (
    <span className={`${defaultStyles} ${styles.primaryBadge} ${cursorStyles} ${className || ''} ${highlightedClass}`} onClick={onClick}>
      {children}
    </span>
  );
}
