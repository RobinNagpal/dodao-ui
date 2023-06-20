type StatusBadgeProps = {
  status: string;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyles = '  inline-flex items-center rounded-full px-2 py-2 text-xl font-medium';

  let badgeText = status;

  if (status == 'Draft') {
    badgeStyles += ' bg-blue-100 text-blue-700';
  } else if (status == 'Live') {
    badgeStyles += ' bg-green-100 text-green-700';
  }

  return <span className={badgeStyles}>{badgeText}</span>;
};
