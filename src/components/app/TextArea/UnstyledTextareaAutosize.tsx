import React, { useEffect, useRef, useState } from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import styled from 'styled-components';

export interface TextareaAutosizeProps {
  id?: string;
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

const TextareaWrapper = styled.div`
  width: 100%;
  background-color: transparent;
  display: flex;
`;

const Textarea = styled.textarea.attrs((props) => ({
  placeholder: props.placeholder,
}))`
  padding: 0.5rem 0.5rem 1.5rem 0.5rem;
  background-color: transparent;
  flex-grow: 1;
  width: 100%;
  resize: none;
  overflow: hidden;
`;

const WarningIcon = styled.div`
  display: inline-block;
  padding: 0.25rem;
  margin-top: 0.375rem;
  margin-right: -0.25rem;
  color: red;
`;

function UnstyledTextareaAutosize({
  id = '',
  modelValue = '',
  minHeight = 100,
  maxHeight = 300,
  number,
  error,
  onUpdate,
  placeholder,
  className,
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

  return (
    <TextareaWrapper className={className}>
      <Textarea ref={textareaRef} onChange={handleInput} onFocus={resize} value={modelValue as string} placeholder={placeholder} />
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
    </TextareaWrapper>
  );
}
export default UnstyledTextareaAutosize;
