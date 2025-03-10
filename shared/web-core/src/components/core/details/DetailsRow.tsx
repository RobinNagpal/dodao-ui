import { ReactNode } from 'react';
import styles from './DetailsRow.module.scss';
export interface DetailsFieldProps {
  label: string;
  value: string | ReactNode | ReactNode[];
}

export default function DetailsRow(props: DetailsFieldProps) {
  return (
    <div className={`px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 ${styles.styledDl}`}>
      <dt className="px-2 text-sm leading-6">{props.label}</dt>
      <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 break-words truncate">{props.value}</dd>
    </div>
  );
}
