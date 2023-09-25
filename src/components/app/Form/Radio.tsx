import styles from './Radio.module.scss';

export interface RadioProps {
  id: string;
  labelContent: string;
  isSelected: boolean;
  className?: string;
  readonly?: boolean;
  onChange: (value: boolean) => void;
  questionId: string;
}

export default function Radio({ id, labelContent, isSelected, className, readonly, onChange, questionId }: RadioProps) {
  return (
    <div key={id} className={`custom-radio flex items-center align-middle ${className || ''}`}>
      <div className="relative mt-2">
        <input
          id={id}
          name={questionId}
          type="radio"
          checked={isSelected}
          disabled={!!readonly}
          readOnly={readonly}
          onChange={() => onChange(!isSelected)}
          className={`h-4 w-4 border focus:ring focus:outline-none mr-2 peer -mt-3 ${styles.styledInput}`}
          required
        />
        <div className={`${styles.overlay} ${readonly ? styles.readonly : ''} ${isSelected ? 'isSelected' : ''}`} />
      </div>
      <label htmlFor={id} className={`ml-2 block text-sm leading-6 markdown-body ${styles.styledLabel}`} dangerouslySetInnerHTML={{ __html: labelContent }} />
    </div>
  );
}
