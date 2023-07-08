import { CreateSignedUrlInput, useCreateSignedUrlMutation } from '@/graphql/generated/generated-types';
import { PropsWithChildren } from '@/types/PropsWithChildren';

import { getUploadedImageUrlFromSingedUrl } from '@/utils/upload/getUploadedImageUrlFromSingedUrl';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';
import React, { SetStateAction, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

interface MarkdownEditorProps extends PropsWithChildren {
  id?: string;
  spaceId: string;
  objectId: string;
  imageType: string;
  placeholder?: string;
  modelValue?: string;
  error?: string | boolean;
  editorClass?: string;
  editorStyles?: React.CSSProperties;
  onUpdate?: (value: string) => void;
  maxHeight?: number;
  label?: React.ReactNode;
  info?: React.ReactNode;
  className?: string;
}

const MainDiv = styled.div`
  .w-md-editor-toolbar {
    background-color: var(--bg-color);
    border-color: var(--block-bg);
    li {
      button {
        font-size: 16px;
        svg {
          color: var(--text-color);
          width: 20px;
          height: 20px;
        }
      }
      font-size: 16px;
    }
  }

  .w-md-editor-show-edit {
    color: var(--text-color);
    background-color: var(--block-bg);
    box-shadow: none;
    border: 1px solid var(--border-color);
  }

  .w-md-editor {
    color: var(--text-color);
    border-color: var(--border-color);
  }
  .wmde-markdown-color {
    background-color: var(--block-bg);
    color: var(--text-color);
    width: 100%;
    --color-prettylights-syntax-comment: var(--text-color);
    --color-prettylights-syntax-constant: var(--text-color);
    --color-prettylights-syntax-entity: var(--text-color);
    --color-prettylights-syntax-storage-modifier-import: var(--text-color);
    --color-prettylights-syntax-entity-tag: var(--text-color);
    --color-prettylights-syntax-keyword: var(--text-color);
    --color-prettylights-syntax-string: var(--text-color);
    --color-prettylights-syntax-variable: var(--text-color);
    --color-prettylights-syntax-brackethighlighter-unmatched: var(--text-color);
    --color-prettylights-syntax-invalid-illegal-text: var(--text-color);
    --color-prettylights-syntax-invalid-illegal-bg: var(--text-color);
    --color-prettylights-syntax-carriage-return-text: var(--text-color);
    --color-prettylights-syntax-carriage-return-bg: var(--text-color);
    --color-prettylights-syntax-string-regexp: var(--text-color);
    --color-prettylights-syntax-markup-list: var(--text-color);
    --color-prettylights-syntax-markup-heading: var(--text-color);
    --color-prettylights-syntax-markup-italic: var(--text-color);
    --color-prettylights-syntax-markup-bold: var(--text-color);
    --color-prettylights-syntax-markup-deleted-text: var(--text-color);
    --color-prettylights-syntax-markup-deleted-bg: var(--text-color);
    --color-prettylights-syntax-markup-inserted-text: var(--text-color);
    --color-prettylights-syntax-markup-inserted-bg: var(--text-color);
    --color-prettylights-syntax-markup-changed-text: var(--text-color);
    --color-prettylights-syntax-markup-changed-bg: var(--text-color);
    --color-prettylights-syntax-markup-ignored-text: var(--text-color);
    --color-prettylights-syntax-markup-ignored-bg: var(--text-color);
    --color-prettylights-syntax-meta-diff-range: var(--text-color);
    --color-prettylights-syntax-brackethighlighter-angle: var(--text-color);
    --color-prettylights-syntax-sublimelinter-gutter-mark: var(--text-color);
    --color-prettylights-syntax-constant-other-reference-link: var(--text-color);
    --color-fg-default: var(--text-color);
    --color-fg-muted: var(--text-color);
    --color-fg-subtle: var(--text-color);
    --color-canvas-default: var(--text-color);
    --color-canvas-subtle: var(--text-color);
    --color-border-default: var(--text-color);
    --color-border-muted: var(--text-color);
    --color-neutral-muted: var(--text-color);
    --color-accent-fg: var(--text-color);
    --color-accent-emphasis: var(--text-color);
    --color-attention-subtle: var(--text-color);
    --color-danger-fg: var(--text-color);
  }
  .w-md-editor-text-input {
    color: var(--text-color);
  }
  textarea {
    background-color: transparent;
    color: var(--text-color);
  }
  .language-markdown {
    background-color: var(--block-bg);
    color: var(--text-color);
  }
`;

function MarkdownEditor({
  id = '',
  spaceId,
  objectId,
  imageType,
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
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState<string | undefined>();

  const [createSignedUrlMutation, { loading: creatingSingedUrl }] = useCreateSignedUrlMutation();
  const handleInput = (value: SetStateAction<string | undefined>) => {
    setMarkdown(value || '');
    onUpdate && onUpdate(value?.toString() || '');
  };

  const insertToTextArea = (intsertString: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) {
      return null;
    }

    let sentence = textarea.value;
    const len = sentence.length;
    const pos = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const front = sentence.slice(0, pos);
    const back = sentence.slice(pos, len);

    sentence = front + intsertString + back;

    textarea.value = sentence;
    textarea.selectionEnd = end + intsertString.length;

    return sentence;
  };

  async function uploadToS3AndReturnImgUrl(imageType: string, file: File, objectId: string) {
    const input: CreateSignedUrlInput = {
      imageType,
      contentType: file.type,
      objectId,
      name: file.name.replace(' ', '_').toLowerCase(),
    };

    const response = await createSignedUrlMutation({ variables: { spaceId, input } });

    const signedUrl = response?.data?.payload!;
    await axios.put(signedUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    const imageUrl = getUploadedImageUrlFromSingedUrl(signedUrl);
    return imageUrl;
  }

  // https://github.com/uiwjs/react-md-editor/issues/83
  const onImagePasted = async (dataTransfer: DataTransfer, setMarkdown: (value: SetStateAction<string | undefined>) => void) => {
    const files: File[] = [];
    for (let index = 0; index < dataTransfer.items.length; index += 1) {
      const file = dataTransfer.files.item(index);

      if (file) {
        files.push(file);
      }
    }

    await Promise.all(
      files.map(async (file) => {
        const url = await uploadToS3AndReturnImgUrl(imageType, file, objectId);
        const insertedMarkdown = insertToTextArea(`![](${url})`);
        if (!insertedMarkdown) {
          return;
        }
        setMarkdown(insertedMarkdown);
      })
    );
  };

  const fieldId = uuidV4();
  return (
    <div>
      <label htmlFor={id || fieldId} className="block text-sm font-medium leading-6 mb-1">
        {label} {children}
      </label>
      <MainDiv className="w-full bg-transparent flex">
        <MDEditor
          value={modelValue}
          onChange={handleInput}
          onPaste={async (event) => {
            await onImagePasted(event.clipboardData, handleInput);
          }}
          onDrop={async (event) => {
            await onImagePasted(event.dataTransfer, handleInput);
          }}
          height={maxHeight || 440}
          textareaProps={{
            placeholder: 'Fill in your markdown for the coolest of the cool.',
          }}
          className={'w-full ' + editorClass}
          preview={'edit'}
        />
      </MainDiv>

      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default MarkdownEditor;
