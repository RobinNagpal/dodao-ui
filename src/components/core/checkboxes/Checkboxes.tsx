import { ReactElement } from 'react';
import styled from 'styled-components';

export interface CheckboxItem {
  id: string;
  name: string;
  label: ReactElement | string;
}

export interface CheckboxesProps {
  label: ReactElement | string;
  items: CheckboxItem[];
}

const StyledInput = styled.input`
  color: var(--primary-color);
  :focus {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
`;
export default function Checkboxes(props: CheckboxesProps) {
  return (
    <fieldset className="mt-2">
      <legend>{props.label}</legend>
      <div className="space-y-3 mt-3">
        {props.items.map((item) => (
          <div className="relative flex items-start" key={item.id}>
            <div className="flex h-6 items-center">
              <StyledInput id={item.id} aria-describedby="comments-description" name={item.name} type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor={item.id} className="font-medium">
                {item.label}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
