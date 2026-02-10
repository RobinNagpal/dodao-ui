import GenerateImageUsingDalleAdvanced from '@/components/app/Image/GenerateImageUsingDalleAdvanced';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ChatCompletionRequestMessageRoleEnum, ImagesResponse, OpenAiChatCompletionResponse } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import axios from 'axios';

export interface GenerateFromDalleModalProps {
  open: boolean;
  onClose: () => void;
  onInput: (url: string) => void;
  generateImagePromptFn: () => string;
}
export default function GenerateFromDalleModal({ open, onClose, onInput, generateImagePromptFn }: GenerateFromDalleModalProps) {
  const [generatingImage, setGeneratingImage] = React.useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = React.useState<string>();
  const [enterManualPrompt, setEnterManualPrompt] = React.useState(false);

  async function generateImage() {
    setGeneratingImage(true);
    const response = await axios.post(`${getBaseUrl()}/api/openAI/ask-chat-completion-ai`, {
      input: {
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: generateImagePromptFn!(),
          },
        ],
        n: 1,
      },
    });
    const result = response.data.completion as OpenAiChatCompletionResponse;
    const openAIGeneratedPrompts = result.choices.map((choice) => choice.message?.content).filter((content) => content);
    const prompt = (openAIGeneratedPrompts![0] as string) || '';

    const imageResponse = await axios.post('/api/openAI/generate-image', {
      input: {
        prompt: `${prompt}\n\nMake sure not to add any text to the image.`,
      },
    });
    const imageResp: ImagesResponse = imageResponse.data.response;

    const imageUrl = imageResp?.data?.map((d) => d.url).filter((url) => url)[0];
    setGeneratedImageUrl(imageUrl!);
    setGeneratingImage(false);
  }

  useEffect(() => {
    if (open) {
      generateImage();
    }
  }, [open]); // Runs the effect when 'open' changes;

  return (
    <FullPageModal open={open} onClose={() => onClose()} title={'Generate Image using DALL·E'} className={'min-h-128'}>
      {enterManualPrompt ? (
        <GenerateImageUsingDalleAdvanced onInput={onInput} generateImagePromptFn={generateImagePromptFn} />
      ) : (
        <div className="p-4 overflow-y-scroll flex flex-col space-y-4 justify-center items-center">
          {generatingImage ? (
            <div className="flex items-center justify-center" style={{ height: '450px', width: '450px' }}>
              <ArrowPathRoundedSquareIcon className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
            </div>
          ) : (
            <div className="h-max" style={{ minHeight: '600px', paddingTop: '32px' }}>
              <div className="relative" style={{ height: '450px', width: '450px' }}>
                <div className="flex justify-end">
                  <Button variant="contained" primary onClick={() => setEnterManualPrompt(true)}>
                    Advanced
                  </Button>
                  <IconButton className="ml-2" iconName={IconTypes.Reload} removeBorder disabled={generatingImage} onClick={() => generateImage()} />
                </div>
                {!generatingImage && generatedImageUrl && <img src={generatedImageUrl} alt="Generated Image" className="h-full w-full my-4" />}
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-between">
            <Button onClick={() => onClose()}>Cancel</Button>
            <Button disabled={!generatedImageUrl} variant="contained" primary onClick={() => onInput(generatedImageUrl as string)} className="ml-4">
              Use this image
            </Button>
          </div>
        </div>
      )}
    </FullPageModal>
  );
}
