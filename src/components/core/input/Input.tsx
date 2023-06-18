import Icon from '@/components/app/Icon';
import { PropsWithChildren } from '@/types/PropsWithChildren';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface TextInputProps extends PropsWithChildren {
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

const Wrapper = styled.div<{ error?: string | boolean; disabled?: boolean }>`
  position: relative;
  overflow: hidden;
  padding-top: 22px;
  margin-bottom: 3px;
  border-bottom: 1px solid;
  border-color: ${({ error }) => (error ? 'red' : 'skin-border')};
  background-color: transparent;
  text-align: left;
  width: 100%;
  display: flex;
  padding-right: 3px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  transition: border-color 0.15s ease-in-out;

  &:hover {
    border-color: ${({ disabled }: { disabled?: boolean }) => (disabled ? 'skin-border' : 'skin-link')};
  }
`;

const Input = styled.input`
  z-index: 1;
  flex: 1;
  width: 100%;
  background: none;
  border: none;
  outline: none;
  ${({ additionalInputClass }: { additionalInputClass?: string }) => additionalInputClass}
`;

const InputLabel = styled.div<{ $selected: boolean }>`
  position: absolute;
  white-space: nowrap;
  transform: ${(props) => (props.$selected ? 'translateY(-18px)' : 'none')};
  font-size: ${(props) => (props.$selected ? '0.75rem' : 'inherit')};
  transition: transform 0.1s linear, font-size 0.1s linear;
`;

const SlotSelected = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow-x: auto;
`;

export default function TextInput({
  modelValue,
  placeholder,
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
  className,
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

  return (
    <Wrapper error={error} disabled={disabled} className={className || ''}>
      <Input
        ref={inputRef}
        value={modelValue || ''}
        onChange={handleInput}
        placeholder={!isFocus && !(label || children) ? placeholder : ''}
        type={number ? 'number' : 'text'}
        disabled={disabled}
        required={required}
        maxLength={maxLength ? maxLength : undefined}
        min={min ? min : undefined}
        max={max ? max : undefined}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />{' '}
      <InputLabel $selected={isFocus || !!modelValue}>
        {label} {children}
      </InputLabel>
      {info}
      {error && (
        <span>
          <Icon name="warning" className="!text-red p-1 block pt-2 mt-[6px] -mr-1" />
        </span>
      )}
    </Wrapper>
  );
}
