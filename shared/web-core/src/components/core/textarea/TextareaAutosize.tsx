import React, { useEffect, useRef, useState } from 'react';
import styles from './TextareaAutosize.module.scss';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { v4 } from 'uuid';

export interface TextareaAutosizeProps {
  id?: string;
  label: string | null;
  modelValue?: string | number;
  autosize?: boolean;
  fillParent?: boolean; // New prop for full parent height
  minHeight?: number;
  maxHeight?: number;
  number?: number;
  error?: string | boolean;
  onUpdate?: (value: string | number | undefined) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  textAreaClassName?: string;
  infoText?: string;
  onBlur?: () => void;
  rows?: number;
}

export default function TextareaAutosize({
  id = '',
  modelValue = '',
  minHeight = 100,
  maxHeight = 300,
  fillParent,
  number,
  error,
  onUpdate,
  onKeyDown,
  placeholder,
  className,
  textAreaClassName,
  label,
  infoText,
  onBlur,
  rows = 3,
}: TextareaAutosizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [maxHeightScroll, setMaxHeightScroll] = useState(false);

  const resize = () => {
    if (textareaRef.current) {
      if (fillParent) {
        // If fillParent is true, set height to 100% of the parent container.
        textareaRef.current.style.height = '100%';
      } else {
        // Reset the height to auto before calculating the new height.
        textareaRef.current.style.height = 'auto';
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
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    const contents = e.target.value;
    if (number) {
      onUpdate && onUpdate(!contents ? undefined : parseFloat(contents));
    } else {
      onUpdate && onUpdate(contents);
    }
  };

  useEffect(() => {
    resize();
  }, [minHeight, maxHeight, id, fillParent]);

  useEffect(() => {
    resize();
  }, []);

  useEffect(() => {
    resize();
  }, [modelValue]);

  const uuid = v4();
  const slugLabel = (label && slugify(label)) || '';

  return (
    <div className={'w-full mt-2 ' + className || ''}>
      {label && (
        <label htmlFor={id || slugLabel || uuid} className="block text-sm font-semibold leading-6">
          {label}
        </label>
      )}
      <div className="mt-2 w-full h-full">
        <textarea
          name={id || slugLabel || uuid}
          id={id || slugLabel || uuid}
          className={`
            ${styles.textarea} 
            ${error ? styles.error : ''} 
            ${fillParent ? styles.fullHeight : ''} 
            ${textAreaClassName || ''}
            
            w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
          `}
          ref={textareaRef}
          onChange={handleInput}
          onFocus={resize}
          value={modelValue as string}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          rows={rows}
          onBlur={onBlur}
        />
        {infoText && <p className="mt-1 text-xs">{infoText}</p>}
        {error && typeof error === 'string' && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
