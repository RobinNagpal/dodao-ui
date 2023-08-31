import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Table, TableRow } from '@/components/core/table/Table';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

const defaultPrompt = `
Generate an image description (within 100 words) with the theme as TOPIC and image
depicts DETAILS. Strictly ensure the following rules while generating the description:
- Depict the basic essence of the DETAILS
- Do not use terms like representing and symbolizing in the description.
- The image must not include any numbers, digits, alphabets, texts, irrelevant, absurd, or odd icons/signs, even if suggested by the DETAILS or TOPIC.
- Also refrain from mentioning anything particular in image description which can only be described in numbers/digits or quantitative values.
- Do not invent or add any details that are not suggested by the DETAILS.
- The image should be of high quality, preferably no less than 300 dpi for print or 72 dpi for web.
- The image should be clear, without any ambiguous elements.
- The image should be visually appealing, avoiding overly bright or clashing colours.
`;

interface GenerateImageForm {
  numberOfImages: number;
  contents: string;
  topic: string;
  openAIPrompt: string;
  imageType: string;
}

function getGenerateImagesPrompt(form: GenerateImageForm) {
  return `
TOPIC = "${form.topic}"
DETAILS = "${form.contents}"


${form.openAIPrompt}
`;
}

export default function GenerateImage() {
  const generateImagesForm = localStorage.getItem('generate_images_form');

  const [form, setForm] = useState<GenerateImageForm>(
    generateImagesForm
      ? JSON.parse(generateImagesForm)
      : {
          numberOfImages: 4,
          contents: '',
          topic: '',
          openAIPrompt: defaultPrompt,
          imageType: 'Oil Painting',
        }
  );

  const updateFormField = (field: keyof GenerateImageForm, value: string | number) => {
    setForm((prevForm) => {
      const updatedForm = {
        ...prevForm,
        [field]: value,
      };
      localStorage.setItem('generate_images_form', JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const resetForm = () => {
    setForm({
      numberOfImages: 4,
      contents: '',
      topic: '',
      openAIPrompt: defaultPrompt,
      imageType: 'Oil Painting',
    });
  };

  const [imagePrompts, setImagePrompts] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [generatingImagePrompts, setGeneratingImagePrompts] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);

  const [generateImageMutation] = useGenerateImageMutation();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { showNotification } = useNotificationContext();

  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  async function generateImage(prompt: string): Promise<string | undefined> {
    setGeneratingImages(true);

    const response = await generateImageMutation({
      variables: {
        input: {
          prompt: `${prompt} \n\n Generated image should be of the type of: ${form.imageType}`,
        },
      },
    });

    const imageUrl = response.data?.generateImage?.data?.map((d) => d.url).filter((url) => url)[0];
    setGeneratingImages(false);
    return imageUrl || undefined;
  }

  const generateImages = async () => {
    const imageUrls: string[] = [];
    for (const prompt of imagePrompts) {
      const url = await generateImage(prompt);
      if (url) {
        imageUrls.push(url);
        setImageUrls([...imageUrls]);
      }
    }

    setImageUrls(imageUrls);
  };

  const generateImagePrompts = async () => {
    setGeneratingImagePrompts(true);
    const response = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [
            {
              role: ChatCompletionRequestMessageRoleEnum.User,
              content: getGenerateImagesPrompt(form),
            },
          ],
          n: form.numberOfImages,
        },
      },
    });
    const openAIGeneratedPrompts = response.data?.askChatCompletionAI.choices.map((choice) => choice.message?.content).filter((content) => content);
    setImagePrompts((openAIGeneratedPrompts as string[]) || []);
    setGeneratingImagePrompts(false);
  };

  return (
    <div className="text-left	">
      <div className="w-full flex justify-end ">
        <Button onClick={resetForm} variant="outlined">
          Reset Form
        </Button>
      </div>
      <Input label="Topic" modelValue={form.topic} onUpdate={(v) => updateFormField('topic', v || '')} />
      <TextareaAutosize
        label="Content"
        id="content"
        autosize={true}
        modelValue={form.contents}
        minHeight={100}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          updateFormField('contents', contents);
        }}
        className="mt-6"
        placeholder={'Prompt that will be used to generate the image.'}
      />
      <StyledSelect
        label={'Number of Images'}
        selectedItemId={form.numberOfImages.toString()}
        items={[
          { id: '1', label: '1' },
          { id: '2', label: '2' },
          { id: '3', label: '3' },
          { id: '4', label: '4' },
        ]}
        setSelectedItemId={(value) => updateFormField('numberOfImages', value ? parseInt(value) : 2)}
      />
      <TextareaAutosize
        label="Open AI Prompt"
        id="openAIPrompt"
        autosize={true}
        modelValue={form.openAIPrompt}
        minHeight={100}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          updateFormField('openAIPrompt', contents);
        }}
        className="mt-6"
        placeholder={'Prompt that will be used to generate the image.'}
        infoText={'Prompt that will be used by Chat GPT to create description for image to be generated.'}
      />

      <Button
        loading={generatingImagePrompts}
        onClick={() => {
          setImagePrompts([]);
          generateImagePrompts();
        }}
        variant="contained"
        primary
        className="mt-4"
      >
        Generate Image Prompts
      </Button>

      {imagePrompts.length > 0 && (
        <>
          <Table
            data={imagePrompts.map(
              (ip, index): TableRow => ({
                item: ip,
                columns: [`${index}`, ip],
                id: index.toString(),
              })
            )}
            columnsHeadings={['S.No.', 'Prompt']}
            columnsWidthPercents={[20, 80]}
          />
          <Input label="Image Type" modelValue={form.imageType} onUpdate={(v) => updateFormField('imageType', v || '')} />
          <Button disabled={generatingImages} loading={generatingImages} onClick={generateImages} variant="contained" primary className="mt-4">
            Generate Images
          </Button>
        </>
      )}
      {imageUrls.length > 0 && (
        <div className="w-full flex justify-start my-4">
          {imageUrls.map((imageUrl) => (
            <div className="mx-2" key={imageUrl}>
              <img src={imageUrl} alt={'generated image'} width={512} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
