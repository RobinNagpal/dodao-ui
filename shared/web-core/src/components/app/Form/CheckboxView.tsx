import classNames from '@dodao/web-core/utils/classNames'; // Adjust import as needed
import styles from './CheckboxView.module.scss'; // Adjust import path as needed

export interface CheckboxViewProps {
  id: string;
  labelContent: string;
  isChecked: boolean;
  className?: string;
  readonly?: boolean;
  onChange: (value: boolean) => void;
}

export default function CheckboxView({ id, labelContent, isChecked, className, readonly, onChange }: CheckboxViewProps) {
  return (
    <div
      className={classNames(
        styles.checkboxOption,
        isChecked && styles.checked,
        'relative  block  rounded-lg border border-gray-300  px-6 py-4 shadow-sm focus:outline-none',
        className
      )}
      onClick={() => onChange(!isChecked)}
    >
      <div className={`${styles.checkboxTick}`} />
      <label htmlFor={id} className={`block text-sm font-medium leading-6 markdown-body ${styles.label}`} dangerouslySetInnerHTML={{ __html: labelContent }} />
    </div>
  );
}
