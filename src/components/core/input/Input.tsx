import { PropsWithChildren } from '@/types/PropsWithChildren';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

interface TextInputProps extends PropsWithChildren {
  id?: string;
  name?: string;
  modelValue?: string | number | null;
  placeholder?: string;
  error?: string | boolean;
  disabled?: boolean;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  number?: boolean;
  required?: boolean;
  onUpdate?: (value: string | number | undefined) => void;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}

const StyledInput = styled.input<{ error?: string | boolean }>`
  background-color: var(--bg-color);
  border-color: var(--primary-color);
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

export default function Input({
  modelValue,
  placeholder,
  id,
  error,
  number,
  disabled,
  maxLength,
  min,
  max,
  required = true,
  onUpdate,
  label,
  info,
  children,
}: TextInputProps) {
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (number) {
      onUpdate?.(!input ? undefined : parseFloat(input));
    } else {
      onUpdate?.(input);
    }
  };

  const inputId = uuidV4();

  return (
    <div className="mt-2">
      <label htmlFor={id || inputId} className="block text-sm font-medium leading-6">
        {label} {children}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <StyledInput
          id={id || inputId}
          ref={inputRef}
          value={modelValue || ''}
          onChange={handleInput}
          placeholder={placeholder}
          type={number ? 'number' : 'text'}
          disabled={disabled}
          required={required}
          maxLength={maxLength ? maxLength : undefined}
          min={min ? min : undefined}
          max={max ? max : undefined}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          className="block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6"
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {info && <p className="mt-2 text-sm">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
