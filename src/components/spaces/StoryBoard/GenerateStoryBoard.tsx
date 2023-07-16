import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Table, TableRow } from '@/components/core/table/Table';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

const defaultImagePrompt = `
Generate an image description (within 30 words) with the theme as TOPIC and image
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

const storyBoardSample = {
  panels: [
    {
      scene: 'Charlie Brown is ask Sam a question.',
      dialogues: [
        {
          user: 'Charlie Brown',
          text: 'Hey there! Do you know what is Credit Score?',
        },
        {
          user: 'Sam',
          text: 'No I don’t. Can you tell me about it?',
        },
      ],
    },
    {
      scene: 'Charlie Brown explaining to Sam',
      dialogues: [
        {
          user: 'Charlie Brown',
          text: 'A credit score is a number that helps determine the risk when considering issuing you a loan or credit card.',
        },
        {
          user: 'Sam',
          text: 'Okay. So how is it calculated?',
        },
      ],
    },
  ],
};

const defaultStoryBoardPrompt = `
Generate a storyboard for the above TOPIC and  DETAILS. storyboard is interaction between two people. Make sure the storyboard has 8 panels. Strictly 
ensure the following JSON format while generating the storyboard:

${JSON.stringify(storyBoardSample, null, 2)}

JSON output is:
`;

interface GenerateStoryboardForm {
  contents: string;
  topic: string;
  openAIStoryboardPrompt: string;
  openAIImagePrompt: string;
  imageActor: string;
  imageType: string;
}

function getGenerateImagesPrompt(form: GenerateStoryboardForm) {
  return `
TOPIC = "${form.topic}"
DETAILS = "${form.contents}"


${form.openAIImagePrompt}
`;
}

function getGenerateStoryboardPrompt(form: GenerateStoryboardForm) {
  return `
TOPIC = "${form.topic}"
DETAILS = "${form.contents}"


${form.openAIStoryboardPrompt}
`;
}

export default function GenerateStoryBoard() {
  const generateStoryboardForm = localStorage.getItem('generate_story_book_form');

  const defaultFormValues: GenerateStoryboardForm = {
    contents: '',
    topic: '',
    openAIStoryboardPrompt: defaultStoryBoardPrompt,
    openAIImagePrompt: defaultImagePrompt,
    imageActor: 'Charlie Brown',
    imageType: 'Oil Painting',
  };

  const [form, setForm] = useState<GenerateStoryboardForm>(generateStoryboardForm ? JSON.parse(generateStoryboardForm) : defaultFormValues);

  const updateFormField = (field: keyof GenerateStoryboardForm, value: string | number) => {
    setForm((prevForm) => {
      const updatedForm = {
        ...prevForm,
        [field]: value,
      };
      localStorage.setItem('generate_story_book_form', JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const resetForm = () => {
    setForm(defaultFormValues);
  };

  const [storyboardScript, setStoryboardScript] = useState<string>();

  const [imagePrompts, setImagePrompts] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generateImageMutation] = useGenerateImageMutation();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { showNotification } = useNotificationContext();

  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  async function generateImage(prompt: string): Promise<string | undefined> {
    setLoading(true);

    const response = await generateImageMutation({
      variables: {
        input: {
          prompt: `${prompt} \n\n Generated image should be of the type of: ${form.imageType}`,
        },
      },
    });

    const imageUrl = response.data?.generateImage?.data?.map((d) => d.url).filter((url) => url)[0];
    setLoading(false);
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

  const generateStoryboardScriptPrompt = async () => {
    setLoading(true);
    const response = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [
            {
              role: ChatCompletionRequestMessageRoleEnum.User,
              content: getGenerateStoryboardPrompt(form),
            },
          ],
          n: 1,
        },
      },
    });
    const script = response.data?.askChatCompletionAI.choices?.[0]?.message?.content;
    setStoryboardScript(script || '');
    setLoading(false);
  };

  const generateImagePrompts = async () => {
    setLoading(true);
    const response = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [
            {
              role: ChatCompletionRequestMessageRoleEnum.User,
              content: getGenerateImagesPrompt(form),
            },
          ],
          n: 1,
        },
      },
    });
    const openAIGeneratedPrompts = response.data?.askChatCompletionAI.choices.map((choice) => choice.message?.content).filter((content) => content);
    setImagePrompts((openAIGeneratedPrompts as string[]) || []);
    setLoading(false);
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

      <TextareaAutosize
        label="Open AI Storyboard Prompt"
        id="openAIStoryboardPrompt"
        autosize={true}
        modelValue={form.openAIStoryboardPrompt}
        minHeight={100}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          updateFormField('openAIStoryboardPrompt', contents);
        }}
        className="mt-6"
        placeholder={'Prompt that will be used to generate storyboard script.'}
        infoText={'Prompt that will be used to generate storyboard script.'}
      />

      <Button
        loading={loading}
        onClick={() => {
          setStoryboardScript('');
          generateStoryboardScriptPrompt();
        }}
        variant="contained"
        primary
        className="mt-4"
      >
        Generate Storyboard Script
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
          <Button disabled={loading} loading={loading} onClick={generateImages} variant="contained" primary className="mt-4">
            Generate Images
          </Button>
        </>
      )}

      {storyboardScript && (
        <div>
          <pre>{JSON.stringify(JSON.parse(storyboardScript), null, 2)}</pre>
        </div>
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
