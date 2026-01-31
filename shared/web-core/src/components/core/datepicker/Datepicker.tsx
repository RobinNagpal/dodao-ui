import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import React from 'react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

// Create a styled div wrapper instead of directly styling the DatePicker
const StyledWrapper = styled.div<{ error?: string | boolean }>`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    background-color: var(--bg-color);
    border: ${(props) => (props.error ? '1px solid red' : ``)};
    color: var(--text-color);
    &:focus {
      box-shadow: ${(props) => (props.error ? '0 0 0 2px red' : `0 0 0 2px var(--primary-color)`)};
    }
  }
`;

// Create a wrapper component for DatePicker
const CustomDatePicker = (props: DatepickerProps & { error?: string | boolean }): React.ReactElement => {
  const { error, ...datePickerProps } = props;
  return (
    <StyledWrapper error={error}>
      <DatePicker {...(datePickerProps as DatePickerProps)} />
    </StyledWrapper>
  );
};

export interface DatepickerProps extends PropsWithChildren {
  id?: string;
  date?: Date | null;
  onChange: (date: Date | null, event: React.SyntheticEvent<any> | undefined) => void;
  error?: string | boolean;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}

export default function Datepicker(props: DatepickerProps): React.ReactElement {
  const fieldId = uuidV4();
  const { id, error, label, info, children, className } = props;
  return (
    <div className={'mt-2 ' + (className || '')}>
      <label htmlFor={id || fieldId} className="block text-sm font-medium leading-6">
        {label} {children}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <CustomDatePicker
          onChange={(date: Date | null, event: React.SyntheticEvent<any> | undefined): void => {
            props.onChange(date, event);
          }}
          className="rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          error={props.error}
          id={id || fieldId}
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
