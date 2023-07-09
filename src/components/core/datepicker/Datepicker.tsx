import { PropsWithChildren } from '@/types/PropsWithChildren';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import React, { SyntheticEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

const StyledDatePicker = styled(DatePicker)<{ error?: string | boolean }>`
  background-color: var(--bg-color);
  border: ${(props) => (props.error ? '1px solid red' : ``)};
  color: var(--text-color);
  &:focus {
    box-shadow: ${(props) => (props.error ? '0 0 0 2px red' : `0 0 0 2px var(--primary-color)`)};
  }
`;

export interface DatepickerProps extends PropsWithChildren {
  id?: string;
  date?: Date;
  onChange: (date: Date | null, event: SyntheticEvent<any, Event> | undefined) => void;
  error?: string | boolean;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}
export default function Datepicker(props: DatepickerProps) {
  const fieldId = uuidV4();
  const { id, error, label, info, children, className } = props;
  return (
    <div className={'mt-2 ' + className || ''}>
      <label htmlFor={id || fieldId} className="block text-sm font-medium leading-6">
        {label} {children}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <StyledDatePicker
          selected={props.date}
          onChange={(value, event) => {
            props.onChange(value as Date | null, event);
          }}
          className="rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6"
          error={props.error}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
