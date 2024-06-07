import styles from './StatusBadge.module.scss';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-2 text-xs font-medium  ${status === 'Draft' ? styles.draftBadge : styles.liveBadge} ${
        className || ''
      }`}
    >
      {status}
    </span>
  );
}
