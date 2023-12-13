import generateNewMarkdownContentPrompt from '@/components/app/Markdown/generateNewMarkdownContentPrompt';
import { markdownAIRewriteCommandFacotry } from '@/components/app/Markdown/MarkdownAICommand';
import rewriteMarkdownContentPrompt from '@/components/app/Markdown/rewriteMarkdownContentPrompt';
import SelectAIGeneratorModal from '@/components/app/Markdown/SelectAIGeneratorModal';
import GenerateContentUsingAIModal from '@/components/app/Modal/AI/GenerateContentUsingAIModal';
import UploadImageModal from '@/components/app/Modal/Image/UploadImageModal';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import RobotIconSolid from '@/components/core/icons/RobotIconSolid';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation } from '@/graphql/generated/generated-types';
import { PropsWithChildren } from '@/types/PropsWithChildren';
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { SetStateAction, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidV4 } from 'uuid';

const defaultGuidelines = `- The output should be in simple language and easy to understand.
- The output should be in your own words and not copied from the content provided.
- The output should be between 4-8 paragraphs.
- Don't create a conclusion or summary paragraph.`;

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
  const [showSelectAIModal, setShowSelectAIModal] = useState(false);
  const [showAddNewContentModal, setShowAddNewContentModal] = useState(false);
  const [showRewriteContentModal, setShowRewriteContentModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  const { showNotification } = useNotificationContext();

  const [askChatCompletetionAI] = useAskChatCompletionAiMutation();
  const handleInputContent = (value: SetStateAction<string | undefined>) => {
    onUpdate && onUpdate(value?.toString() || '');
  };

  const rewriteContent = async (text: string) => {
    const response = await askChatCompletetionAI({
      variables: {
        input: {
          messages: [
            {
              role: ChatCompletionRequestMessageRoleEnum.User,
              content: `Rewrite this content and maintain the same word length: \n ${text}`,
            },
          ],
        },
      },
    });
    const rewrittenText = response.data?.askChatCompletionAI?.choices[0]?.message?.content;
    if (rewrittenText) {
      return rewrittenText;
    } else {
      return text;
    }
  };

  const fieldId = uuidV4();
  return (
    <div className="mt-2 w-full">
      <label htmlFor={id || fieldId} className="block text-sm font-medium leading-6 mb-1">
        {label} {children}
      </label>
      <MainDiv className="w-full bg-transparent flex">
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
          extraCommands={[
            {
              name: 'imageUpload',
              keyCommand: 'imageUpload',
              icon: <PhotoIcon />,
              buttonProps: { title: 'Upload Image' },
              execute: () => {
                setShowImageUploadModal(true);
              },
            },
            markdownAIRewriteCommandFacotry(rewriteContent),
            {
              name: 'aiContent',
              keyCommand: 'aiContent',
              icon: <RobotIconSolid />,
              buttonProps: { title: 'AI Content' },
              execute: () => {
                setShowSelectAIModal(true);
              },
            },
          ]}
        />
      </MainDiv>

      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-left text-red-600">{error}</p>}
      {showImageUploadModal && (
        <UploadImageModal
          open={showImageUploadModal}
          onClose={() => setShowImageUploadModal(false)}
          imageType={imageType}
          objectId={objectId}
          spaceId={spaceId}
          imageUploaded={(imageUrl) => {
            handleInputContent(
              modelValue +
                '\n' +
                `
<div align="center">
  <img style="max-height:400px;margin-bottom:30px" src="${imageUrl}"/>
</div>

`
            );
            setShowImageUploadModal(false);
          }}
        />
      )}
      {showSelectAIModal && (
        <SelectAIGeneratorModal
          open={showSelectAIModal}
          onClose={() => setShowSelectAIModal(false)}
          title={'Generate Content'}
          selectGenerateNewContent={() => {
            setShowAddNewContentModal(true);
            setShowSelectAIModal(false);
          }}
          selectRewriteContent={() => {
            setShowRewriteContentModal(true);
            setShowSelectAIModal(false);
          }}
        />
      )}
      {showAddNewContentModal && (
        <GenerateContentUsingAIModal
          open={showAddNewContentModal}
          onClose={() => setShowAddNewContentModal(false)}
          modalTitle={'Generate Content Using AI'}
          guidelines={defaultGuidelines}
          onGenerateContent={(generatedContent) => {
            if (generatedContent) {
              handleInputContent(modelValue + '\n' + generatedContent);
              setShowAddNewContentModal(false);
            } else {
              showNotification({
                heading: 'Error',
                type: 'error',
                message: 'For some reason, we were unable to generate content. Please try again.',
              });
            }
          }}
          generatePrompt={(topic: string, guidelines: string) => generateNewMarkdownContentPrompt(topic, guidelines)}
          generateNewContent={true}
        />
      )}
      {showRewriteContentModal && (
        <GenerateContentUsingAIModal
          open={showRewriteContentModal}
          onClose={() => setShowRewriteContentModal(false)}
          modalTitle={'Generate Content Using AI'}
          guidelines={defaultGuidelines}
          onGenerateContent={(generatedContent) => {
            if (generatedContent) {
              handleInputContent(modelValue + '\n' + generatedContent);
              setShowRewriteContentModal(false);
            } else {
              showNotification({
                heading: 'Error',
                type: 'error',
                message: 'For some reason, we were unable to generate content. Please try again.',
              });
            }
          }}
          generatePrompt={(topic: string, guidelines: string, contents: string) => rewriteMarkdownContentPrompt(topic, guidelines, contents)}
          generateNewContent={false}
        />
      )}
    </div>
  );
}

export default MarkdownEditor;
