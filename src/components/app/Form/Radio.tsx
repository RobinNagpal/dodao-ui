import styled from 'styled-components';

export interface RadioProps {
  id: string;
  labelContent: string;
  isSelected: boolean;
  className?: string;
  readonly?: boolean;
  onChange: (value: boolean) => void;
}

const Overlay = styled.div<{ readonly?: boolean; isSelected?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  pointer-events: none;

  ${({ readonly, isSelected }) =>
    readonly &&
    isSelected &&
    `
    background-color: var(--primary-color);
    
  `}
`;

const StyledInput = styled.input`
  border-color: var(--border-color);
  accent-color: var(--primary-color);
  min-width: 24px;

  &:checked {
    background-color: var(--primary-color) !important;
  }

  &:focus {
    outline-color: var(--primary-color);
  }
  :disabled {
    cursor: not-allowed;
  }
`;

const StyledLabel = styled.label`
  color: var(--text-color);
`;

export default function Radio({ id, labelContent, isSelected, className, readonly, onChange }: RadioProps) {
  return (
    <div key={id} className={`custom-radio flex items-center ${className || ''}`}>
      <div className="relative mt-2">
        <StyledInput
          id={id}
          name="notification-method"
          type="radio"
          defaultChecked={isSelected}
          disabled={!!readonly}
          readOnly={readonly}
          onChange={() => onChange(!isSelected)}
          className="h-4 w-4 border focus:ring focus:outline-none mr-2"
        />
        <Overlay readonly={readonly} isSelected={isSelected} />
      </div>
      <StyledLabel htmlFor={id} className="ml-3 block text-sm font-medium leading-6 markdown-body" dangerouslySetInnerHTML={{ __html: labelContent }} />
    </div>
  );
}
