import { SyntheticEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';

const StyledDatePicker = styled(DatePicker)<{ error?: string | boolean }>`
  background-color: var(--bg-color);
  border: ${(props) => (props.error ? '1px solid red' : ``)};
  color: var(--text-color);
  &:focus {
    box-shadow: ${(props) => (props.error ? '0 0 0 2px red' : `0 0 0 2px var(--primary-color)`)};
  }
`;

export interface DatepickerProps {
  date?: Date;
  onChange: (date: Date | null, event: SyntheticEvent<any, Event> | undefined) => void;
  error?: string | boolean;
}
export default function Datepicker(props: DatepickerProps) {
  return (
    <StyledDatePicker
      selected={props.date}
      onChange={(value, event) => {
        props.onChange(value as Date | null, event);
      }}
      className="rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6 mt-2"
      error={props.error}
    />
  );
}
