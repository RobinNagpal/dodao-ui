import Button from '@/components/core/buttons/Button';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

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

  const [generateImageMutation] = useGenerateImageMutation();
  const [imageUrl, setImageUrl] = useState<string>();

  const [promptGenerated, setPromptGenerated] = useState(false);

  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  async function generateImage(): Promise<void> {
    setGeneratingImages(true);

    const response = await generateImageMutation({
      variables: {
        input: {
          prompt: `${generatedImagePrompt}`,
        },
      },
    });

    const imageUrl = response.data?.generateImage?.data?.map((d) => d.url).filter((url) => url)[0];
    setGeneratingImages(false);

    setImageUrl(imageUrl!);
  }

  const generateImagePrompt = async (regenerate: boolean = false) => {
    regenerate ? setRegeneratingImagePrompt(true) : setGeneratingImagePrompt(true);
    const response = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [
            {
              role: ChatCompletionRequestMessageRoleEnum.User,
              content: generateImagePromptFn!(),
            },
          ],
          n: 1,
        },
      },
    });
    const openAIGeneratedPrompts = response.data?.askChatCompletionAI.choices.map((choice) => choice.message?.content).filter((content) => content);
    setGeneratedImagePrompt((openAIGeneratedPrompts![0] as string) || '');
    regenerate ? setRegeneratingImagePrompt(false) : setGeneratingImagePrompt(false);
    setPromptGenerated(true);
  };

  return (
    <div className="text-left	">
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
          <Button disabled={generatingImages} loading={generatingImages} onClick={() => generateImage()} variant="contained" primary className="mt-4">
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
