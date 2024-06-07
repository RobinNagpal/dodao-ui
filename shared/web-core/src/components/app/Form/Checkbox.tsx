import styles from './Checkbox.module.scss';

export interface CheckboxProps {
  id: string;
  labelContent: string;
  isChecked: boolean;
  className?: string;
  readonly?: boolean;
  onChange: (value: boolean) => void;
}

export default function Checkbox({ id, labelContent, isChecked, className, readonly, onChange }: CheckboxProps) {
  return (
    <div key={id} className={`flex items-center ${className || ''}`}>
      <div className="relative mt-2">
        <input
          id={id}
          name="notification-method"
          type="checkbox"
          checked={isChecked}
          readOnly={readonly}
          onChange={() => onChange(!isChecked)}
          className={`h-4 w-4 border focus:ring focus:outline-none mr-2 ${styles.styledInput}`}
          disabled={readonly}
        />
        <div className={`${styles.checkboxOverlay} ${readonly ? styles.readonly : ''} ${isChecked ? 'isChecked' : ''}`} />
      </div>
      <label
        htmlFor={id}
        className={`ml-2 mt-3 block text-sm font-medium leading-6 markdown-body ${styles.styledLabel}`}
        dangerouslySetInnerHTML={{ __html: labelContent }}
      />
    </div>
  );
}
