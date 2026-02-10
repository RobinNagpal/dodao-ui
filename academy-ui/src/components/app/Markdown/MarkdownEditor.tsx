import SelectImageInputModal from '@/components/app/Image/SelectImageInputModal';
import GenerateContentUsingAIModal from '@/components/app/Modal/AI/GenerateContentUsingAIModal';
import { ChatCompletionRequestMessageRoleEnum, ImageType } from '@/graphql/generated/generated-types';
import generateNewMarkdownContentPrompt from '@dodao/web-core/components/app/Markdown/generateNewMarkdownContentPrompt';
import { markdownAIRewriteCommandFactory } from '@dodao/web-core/components/app/Markdown/MarkdownAICommand';
import rewriteMarkdownContentPrompt from '@dodao/web-core/components/app/Markdown/rewriteMarkdownContentPrompt';
import SelectAIGeneratorModal from '@dodao/web-core/components/app/Markdown/SelectAIGeneratorModal';
import RobotIconSolid from '@dodao/web-core/components/core/icons/RobotIconSolid';
import TextAlignCenter from '@dodao/web-core/components/core/icons/TextAlign/TextAlignCenter';
import TextAlignJustify from '@dodao/web-core/components/core/icons/TextAlign/TextAlignJustify';
import TextAlignLeft from '@dodao/web-core/components/core/icons/TextAlign/TextAlignLeft';
import TextAlignRight from '@dodao/web-core/components/core/icons/TextAlign/TextAlignRight';
import { PropsWithChildren } from '@dodao/web-core/types/PropsWithChildren';
import { TextAlign } from '@dodao/web-core/types/ui/TextAlign';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import MDEditor, { commands } from '@uiw/react-md-editor';
import axios from 'axios';
import React, { SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

const defaultGuidelines = `- The output should be in simple language and easy to understand.
- The output should be in your own words and not copied from the content provided.
- The output should be between 4-8 paragraphs.
- Don't create a conclusion or summary paragraph.`;

interface MarkdownEditorProps extends PropsWithChildren {
  id?: string;
  spaceId: string;
  objectId: string;
  imageType: ImageType;
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
  spaceId,
  objectId,
  imageType,
  placeholder = '',
  modelValue = '',
  generateImagePromptFn,
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
  const [showSelectAIModal, setShowSelectAIModal] = useState(false);
  const [showAddNewContentModal, setShowAddNewContentModal] = useState(false);
  const [showRewriteContentModal, setShowRewriteContentModal] = useState(false);
  const [selectImageUploadModal, setSelectImageUploadModal] = useState(false);

  const { showNotification } = useNotificationContext();

  const handleInputContent = (value: SetStateAction<string | undefined>) => {
    onUpdate && onUpdate(value?.toString() || '');
  };

  const rewriteContent = async (text: string) => {
    const response = await axios.post(`${getBaseUrl()}/api/openAI/ask-chat-completion-ai`, {
      input: {
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: `Rewrite this content and maintain the same word length: \n ${text}`,
          },
        ],
      },
    });
    const rewrittenText = response.data?.completion?.choices[0]?.message?.content;
    if (rewrittenText) {
      return rewrittenText;
    } else {
      return text;
    }
  };

  const fieldId = uuidV4();
  return (
    <div className="my-2 w-full markdown-editor-overrides">
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
          extraCommands={[
            ...getTextAlignCommands(setTextAlign, selectedTextAlign),
            {
              name: 'imageUpload',
              keyCommand: 'imageUpload',
              icon: <PhotoIcon />,
              buttonProps: { title: 'Upload Image' },
              execute: () => {
                setSelectImageUploadModal(true);
              },
            },
            markdownAIRewriteCommandFactory(rewriteContent),
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
      </div>

      {info && <p className="mt-1 text-xs">{info}</p>}
      {typeof error === 'string' && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {selectImageUploadModal && (
        <SelectImageInputModal
          open={selectImageUploadModal}
          onClose={() => setSelectImageUploadModal(false)}
          imageType={imageType}
          objectId={objectId}
          spaceId={spaceId}
          generateImagePromptFn={generateImagePromptFn}
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
            setSelectImageUploadModal(false);
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
