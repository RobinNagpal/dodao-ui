import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export default function GenerateImage() {
  const [prompt, setPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generateImageMutation] = useGenerateImageMutation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { showNotification } = useNotificationContext();
  async function generateImage() {
    setImageUrl(null);
    setLoading(true);
    setError(null);

    try {
      const response = await generateImageMutation({
        variables: {
          input: {
            prompt: prompt,
          },
        },
      });

      const imageUrl = response.data?.generateImage?.url;
      if (imageUrl) {
        setImageUrl(imageUrl);
        showNotification({ type: 'success', message: 'Image generated successfully' });
      } else {
        showNotification({ type: 'error', message: 'Error generating image' });
        setError('Error generating image');
      }
    } catch (error) {
      showNotification({ type: 'error', message: 'Error generating image' });
      setError(error?.toString() || 'Error generating image');
      setLoading(false);
      throw error;
    }

    setLoading(false);
  }
  return (
    <div className="text-left	">
      <TextareaAutosize
        label="Content"
        id="content"
        autosize={true}
        modelValue={prompt}
        minHeight={100}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          if (contents.length > 200) {
            setError('Prompt is too long');
          }
          setPrompt(contents);
        }}
        className="mt-6"
        placeholder={'Prompt that will be used to generate the image.'}
      />

      {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}
      {imageUrl && (
        <div className="w-full flex justify-start my-4">
          <img src={imageUrl} alt={'generated image'} width={256} />
        </div>
      )}
      <Button loading={loading} onClick={() => generateImage()} variant="contained" primary className="mt-4">
        Generate Using AI
      </Button>
    </div>
  );
}
