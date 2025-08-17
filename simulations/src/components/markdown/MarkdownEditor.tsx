import TextAlignCenter from '@dodao/web-core/components/core/icons/TextAlign/TextAlignCenter';
import TextAlignJustify from '@dodao/web-core/components/core/icons/TextAlign/TextAlignJustify';
import TextAlignLeft from '@dodao/web-core/components/core/icons/TextAlign/TextAlignLeft';
import TextAlignRight from '@dodao/web-core/components/core/icons/TextAlign/TextAlignRight';
import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import { TextAlign } from '@dodao/web-core/types/ui/TextAlign';
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

interface MarkdownEditorProps extends PropsWithChildren {
  id?: string;
  objectId: string;
  placeholder?: string;
  modelValue?: string;
  error?: string | boolean;
  editorClass?: string;
  editorStyles?: React.CSSProperties;
  onUpdate?: (value: string) => void;
  maxHeight?: number | string;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
  generateImagePromptFn?: () => string;
  selectedTextAlign?: TextAlign;
  setTextAlign?: (align: TextAlign) => void;
}

function SelectionIcon({ selected, children }: { selected: boolean; children: React.ReactNode }) {
  return <div className={selected ? 'border-b-2' : ''}>{children}</div>;
}

function getTextAlignIcon(textAlign: TextAlign) {
  switch (textAlign) {
    case TextAlign.Left:
      return <TextAlignLeft />;
    case TextAlign.Center:
      return <TextAlignCenter />;
    case TextAlign.Right:
      return <TextAlignRight />;
    case TextAlign.Justify:
      return <TextAlignJustify />;
  }
}
function getTextAlignCommand(selectedAlign: TextAlign, textAlign: TextAlign, setTextAlign: (align: TextAlign) => void) {
  return {
    name: `textAlign${textAlign}`,
    keyCommand: `textAlign${textAlign}`,
    icon: <SelectionIcon selected={selectedAlign === textAlign}>{getTextAlignIcon(textAlign)}</SelectionIcon>,
    buttonProps: { title: `Text Align ${textAlign}` },
    execute: () => {
      setTextAlign(textAlign);
    },
  };
}

function getTextAlignCommands(setTextAlign?: (align: TextAlign) => void, selectedAlignment?: TextAlign) {
  const selectedAlign = selectedAlignment || TextAlign.Center;
  if (!setTextAlign) {
    return [];
  }

  return [
    commands.divider,
    getTextAlignCommand(selectedAlign, TextAlign.Left, setTextAlign),
    getTextAlignCommand(selectedAlign, TextAlign.Center, setTextAlign),
    getTextAlignCommand(selectedAlign, TextAlign.Right, setTextAlign),
    getTextAlignCommand(selectedAlign, TextAlign.Justify, setTextAlign),
    commands.divider,
  ];
}

function MarkdownEditor({
  id = '',
  objectId,
  placeholder = '',
  modelValue = '',
  error,
  editorClass,
  editorStyles,
  onUpdate,
  maxHeight,
  label,
  info,
  className,
  children,
  selectedTextAlign,
  setTextAlign,
}: MarkdownEditorProps) {
  const handleInputContent = (value: SetStateAction<string | undefined>) => {
    onUpdate && onUpdate(value?.toString() || '');
  };

  const fieldId = uuidV4();
  return (
    <div className="my-2 w-full h-full markdown-editor-overrides">
      <label htmlFor={id || fieldId} className="block text-sm font-semibold leading-6 mb-1">
        {label} {children}
      </label>
      <div className="w-full bg-transparent flex mt-2">
        <MDEditor
          value={modelValue}
          onChange={handleInputContent}
          height={maxHeight || 440}
          textareaProps={{
            placeholder: 'Fill in your markdown for the coolest of the cool.',
          }}
          className={'w-full ' + editorClass}
          preview={'edit'}
          commands={[
            { ...commands.title1, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H1</div> },
            { ...commands.title2, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H2</div> },
            { ...commands.title3, icon: <div style={{ fontSize: 24, textAlign: 'left' }}>H3</div> },
            commands.divider,
            commands.bold,
            commands.italic,

            commands.divider,

            commands.hr,
            commands.link,
            commands.quote,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,

            commands.codePreview,
            commands.fullscreen,
          ]}
          extraCommands={[...getTextAlignCommands(setTextAlign, selectedTextAlign)]}
        />
      </div>

      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default MarkdownEditor;
