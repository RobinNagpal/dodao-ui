import styled from 'styled-components';

export interface CheckboxProps {
  id: string;
  labelContent: string;
  isChecked: boolean;
  className?: string;
  readonly?: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxOverlay = styled.div<{ readonly?: boolean; isChecked?: boolean }>`
  position: absolute;
  top: 0;
  margin-top: 2px;
  left: 0;
  width: 20px;
  height: 20px;
  pointer-events: none;

  ${({ readonly, isChecked }) =>
    readonly &&
    isChecked &&
    `
    background-color: var(--primary-color);
  `}
`;

const StyledInput = styled.input`
  border-color: var(--border-color);
  accent-color: var(--primary-color);
  width: 20px;
  min-width: 20px;
  cursor:pointer;
  &:checked {
    background-color: var(--primary-color) !important;
  }

`;

const StyledLabel = styled.label`
  color: var(--text-color);
`;

export default function Checkbox({
  id,
  labelContent,
  isChecked,
  className,
  readonly,
  onChange
}: CheckboxProps) {
  return (
    <div key={id} className={`flex items-center ${className || ''}`}>
      <div className="relative mt-2">
        <StyledInput
          id={id}
          name="notification-method"
          type="checkbox"
          defaultChecked={isChecked}
          readOnly={readonly}
          onChange={() => onChange(!isChecked)}
          className="h-4 w-4 border focus:ring focus:outline-none mr-2"
          disabled={readonly}
        />
        <CheckboxOverlay readonly={readonly} isChecked={isChecked} />
      </div>
      <StyledLabel
        htmlFor={id}
        className="ml-3 block text-sm font-medium leading-6 markdown-body"
        dangerouslySetInnerHTML={{ __html: labelContent }}
      />
    </div>
  );
}
