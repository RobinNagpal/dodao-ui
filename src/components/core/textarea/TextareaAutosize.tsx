import { slugify } from '@/utils/auth/slugify';
import React, { useEffect, useRef, useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import styled from 'styled-components';
import { v4 } from 'uuid';

export interface TextareaAutosizeProps {
  id?: string;
  label: string;
  modelValue?: string | number;
  autosize?: boolean;
  minHeight?: number;
  maxHeight?: number;
  number?: number;
  error?: string | boolean;
  onUpdate?: (value: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
}

const Textarea = styled.textarea.attrs((props) => ({
  placeholder: props.placeholder,
}))`
  width: 100%;
  resize: none;
  overflow: hidden;

  background-color: var(--bg-color);
  border-color: var(--primary-color);
  color: var(--text-color);
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-color);
  }
`;

const WarningIcon = styled.div`
  display: inline-block;
  padding: 0.25rem;
  margin-top: 0.375rem;
  margin-right: -0.25rem;
  color: red;
`;

export default function TextareaAutosize({
  id = '',
  modelValue = '',
  minHeight = 100,
  maxHeight = 300,
  number,
  error,
  onUpdate,
  placeholder,
  className,
  label,
}: TextareaAutosizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [maxHeightScroll, setMaxHeightScroll] = useState(false);
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ trigger: 'hover', placement: 'top' });

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset the height to auto before calculating the new height
      let contentHeight = textareaRef.current.scrollHeight;
      if (minHeight) {
        contentHeight = contentHeight < minHeight ? minHeight : contentHeight;
      }
      if (maxHeight) {
        if (contentHeight > maxHeight) {
          contentHeight = maxHeight;
          setMaxHeightScroll(true);
        } else {
          setMaxHeightScroll(false);
        }
      }
      textareaRef.current.style.height = contentHeight + 'px';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    const contents = e.target.value;
    if (number) {
      onUpdate && onUpdate && onUpdate(!contents ? undefined : parseFloat(contents));
    } else {
      onUpdate && onUpdate(contents);
    }
  };

  useEffect(() => {
    resize();
  }, [minHeight, maxHeight, id]);

  useEffect(() => {
    resize();
  }, []);

  useEffect(() => {
    resize();
  }, [modelValue]);

  const uuid = v4();

  const slugLable = slugify(label);

  return (
    <div className={'w-full ' + className || ''}>
      <label htmlFor={id || slugLable || uuid} className="block text-sm font-medium leading-6">
        {label}
      </label>

      <div className="mt-2 w-full">
        <Textarea
          name={id || slugLable || uuid}
          id={id || slugLable || uuid}
          className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          ref={textareaRef}
          onChange={handleInput}
          onFocus={resize}
          value={modelValue as string}
          placeholder={placeholder}
        />
        {error && (
          <div ref={setTriggerRef}>
            <WarningIcon ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
              Warning
            </WarningIcon>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
