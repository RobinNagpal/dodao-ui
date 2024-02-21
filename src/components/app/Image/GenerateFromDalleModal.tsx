import GenerateImageUsingDalleAdvanced from '@/components/app/Image/GenerateImageUsingDalleAdvanced';
import Button from '@/components/core/buttons/Button';
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';

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

  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [generateImageMutation] = useGenerateImageMutation();
  async function generateImage() {
    setGeneratingImage(true);
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
    const prompt = (openAIGeneratedPrompts![0] as string) || '';

    const imageResponse = await generateImageMutation({
      variables: {
        input: {
          prompt: prompt,
        },
      },
    });

    const imageUrl = imageResponse.data?.generateImage?.data?.map((d) => d.url).filter((url) => url)[0];
    setGeneratedImageUrl(imageUrl!);
  }

  useEffect(() => {
    generateImage();
  }, []);

  return (
    <FullPageModal open={open} onClose={() => onClose()} title={'Generate Image using DALL·E'}>
      {enterManualPrompt ? (
        <GenerateImageUsingDalleAdvanced onInput={onInput} generateImagePromptFn={() => ''} />
      ) : (
        <div className="h-[80vh] p-4 overflow-y-scroll flex flex-col space-y-4 justify-center items-center">
          <div className="relative" style={{ height: '450px', width: '450px' }}>
            {!generatingImage && (
              <Button variant="contained" primary onClick={() => setEnterManualPrompt(true)} className="ml-4 absolute -top-10 right-0">
                Enter prompt manually
              </Button>
            )}

            {generatingImage && (
              <div className="h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
            {!generatingImage && <img src={generatedImageUrl} alt="Generated Image" className="h-full w-full" />}
          </div>
          <div>
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
