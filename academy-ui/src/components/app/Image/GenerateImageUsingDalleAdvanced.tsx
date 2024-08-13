import Button from '@dodao/web-core/components/core/buttons/Button';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { ChatCompletionRequestMessageRoleEnum, ImagesResponse, OpenAiChatCompletionResponse } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';
import axios from 'axios';

interface GenerateImageProps {
  onInput: (url: string) => void;
  generateImagePromptFn: () => string;
}

export default function GenerateImageUsingDalleAdvanced({ onInput, generateImagePromptFn }: GenerateImageProps) {
  const [imagePrompt, setImagePrompt] = useState(generateImagePromptFn());

  const [generatedImagePrompt, setGeneratedImagePrompt] = useState('');
  const [generatingImagePrompt, setGeneratingImagePrompt] = useState(false);
  const [regeneratingImagePrompt, setRegeneratingImagePrompt] = useState(false);

  const [generatingImages, setGeneratingImages] = useState(false);

  const [imageUrl, setImageUrl] = useState<string>();

  const [promptGenerated, setPromptGenerated] = useState(false);

  async function generateImage(): Promise<void> {
    setGeneratingImages(true);

    const response = await axios.post(`${getBaseUrl()}/api/openAI/generate-image`, {
      input: {
        prompt: `${generatedImagePrompt}`,
      },
    });

    const result = response.data.response as ImagesResponse;

    const imageUrl = result.data?.map((d) => d.url).filter((url) => url)[0];
    setGeneratingImages(false);
    setImageUrl(imageUrl!);
  }

  const generateImagePrompt = async (regenerate: boolean = false) => {
    regenerate ? setRegeneratingImagePrompt(true) : setGeneratingImagePrompt(true);
    const response = await axios.post('/api/openAI/ask-chat-completion-ai', {
      input: {
        messages: [
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: imagePrompt,
          },
        ],
        n: 1,
      },
    });
    const result = response.data.completion as OpenAiChatCompletionResponse;
    const openAIGeneratedPrompts = result.choices.map((choice) => choice.message?.content).filter((content) => content);
    setGeneratedImagePrompt((openAIGeneratedPrompts![0] as string) || '');
    regenerate ? setRegeneratingImagePrompt(false) : setGeneratingImagePrompt(false);
    setPromptGenerated(true);
  };

  return (
    <div className="text-left	p-4">
      <TextareaAutosize
        label="Open AI Prompt"
        id="openAIPrompt"
        autosize={true}
        modelValue={imagePrompt}
        minHeight={100}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          setImagePrompt(contents);
        }}
        className="mt-6"
        placeholder={'Prompt that will be used to generate the image.'}
        infoText={'Prompt that will be used by Chat GPT to create description for image to be generated.'}
      />

      <Button
        loading={generatingImagePrompt}
        onClick={() => {
          generateImagePrompt();
        }}
        variant="contained"
        primary
        className="mt-4"
      >
        Generate Image Prompt
      </Button>

      {promptGenerated && (
        <>
          <TextareaAutosize
            label="Generated Prompt"
            id="openAIPrompt"
            autosize={true}
            modelValue={generatedImagePrompt}
            minHeight={100}
            onUpdate={(e) => {
              const contents = e?.toString() || '';
              setGeneratedImagePrompt(contents);
            }}
            className="mt-6"
            placeholder={'Prompt that will be used to generate the image.'}
            infoText={'Prompt that will be used by Chat GPT to create image.'}
          />
          <Button
            loading={regeneratingImagePrompt}
            onClick={() => {
              generateImagePrompt(true);
            }}
            variant="contained"
            primary
            className="mt-4"
          >
            Regenerate Image Prompt
          </Button>
          <Button disabled={generatingImages} loading={generatingImages} onClick={() => generateImage()} variant="contained" primary className="mt-4 ml-2">
            Generate Image
          </Button>
        </>
      )}
      {imageUrl && (
        <div className="flex flex-col">
          <div className="w-full flex justify-start my-4">
            <div className="mx-2">
              <img src={imageUrl} alt="generated image" width={256} height={256} />
            </div>
          </div>
          <Button
            disabled={!imageUrl}
            variant="contained"
            primary
            onClick={() => {
              onInput(imageUrl as string);
            }}
            className="mr-4 mt-2 self-start"
          >
            Select Image
          </Button>
        </div>
      )}
    </div>
  );
}
