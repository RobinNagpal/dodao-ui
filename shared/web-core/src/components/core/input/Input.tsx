import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import React, { useRef, useState } from 'react';
import styles from './Input.module.scss';
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
  password?: boolean;
  required?: boolean;
  onUpdate?: (value: string | number | undefined) => void;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
  helpText?: string;
  onBlur?: () => void;
}

export default function Input({
  modelValue,
  placeholder,
  id,
  error,
  number,
  password,
  disabled,
  maxLength,
  min,
  max,
  required = true,
  onUpdate,
  label,
  info,
  children,
  className,
  helpText,
  onBlur,
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
    <div className={'my-2 ' + (className || '')}>
      <label htmlFor={id || inputId} className="block text-sm font-semibold leading-6">
        {label} {children}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <input
          id={id || inputId}
          ref={inputRef}
          className={`block w-full rounded-md border-0 p-1.5 pr-10 ring-1 ring-inset ring-gray-400 shadow-sm focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6 ${
            styles.styledInput
          } ${error ? styles.error : ''}`}
          value={modelValue || ''}
          onChange={handleInput}
          placeholder={placeholder}
          type={number ? 'number' : password ? 'password' : 'text'}
          disabled={disabled}
          required={required}
          maxLength={maxLength ? maxLength : undefined}
          min={min ? min : undefined}
          max={max ? max : undefined}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false);
            onBlur && onBlur();
          }}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {helpText && <p className="ml-1 mt-2 mb-2 italic text-xs">{helpText}</p>}
      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="ml-1 mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
