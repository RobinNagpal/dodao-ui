import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import { Table, TableRow } from '@/components/core/table/Table';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useGenerateImageMutation } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';

interface StoryBoardInterface {
  panels: { dialogues: { text: string; user: string }[]; scene: string }[];
}

const storyBoardSample: StoryBoardInterface = {
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

interface GenerateStoryboardForm {
  contents: string;
  topic: string;
  openAIStoryboardPrompt: string;
  openAIImagePrompt: string;
  imageActor: string;
  imageType: string;
}

function getGenerateImagesPrompt(scene: string, openAIImagePrompt: string) {
  return `
SCENE = "${scene}"

${openAIImagePrompt}
`;
}

const defaultImagePrompt = `
Generate an image description (within 100 words) with the above mentioned SCENE. 
Strictly ensure the following rules while generating the description:
- Depict the basic essence of the SCENE
- Do not use terms like representing and symbolizing in the description.
- The image must not include any numbers, digits, alphabets, texts, irrelevant, absurd, or odd icons/signs, even if suggested by the SCENE.
- Also refrain from mentioning anything particular in image description which can only be described in numbers/digits or quantitative values.
- Do not invent or add any details that are not suggested by the SCENE.
- The image should be of high quality, preferably no less than 300 dpi for print or 72 dpi for web.
- The image should be clear, without any ambiguous elements.
- The image should be visually appealing, avoiding overly bright or clashing colours.
`;

function getGenerateStoryboardPrompt(form: GenerateStoryboardForm) {
  return `
TOPIC = "${form.topic}"
DETAILS = "${form.contents}"


${form.openAIStoryboardPrompt}
`;
}

const defaultStoryBoardPrompt = `
Generate a storyboard for the above TOPIC and  DETAILS. storyboard is interaction between two people. Make sure the storyboard has 4 panels. Strictly 
ensure the following JSON format while generating the storyboard:

${JSON.stringify(storyBoardSample, null, 2)}


Don't create more than 4 panels.


JSON output is:
`;

export default function GenerateStoryBoard() {
  const defaultFormValues: GenerateStoryboardForm = {
    contents: '',
    topic: '',
    openAIStoryboardPrompt: defaultStoryBoardPrompt,
    openAIImagePrompt: defaultImagePrompt,
    imageActor: 'Charlie Brown',
    imageType: 'Oil Painting',
  };

  const [form, setForm] = useState<GenerateStoryboardForm>(defaultFormValues);

  const GENERATE_STORYBOOK_FORM_KEY = 'generate_story_book_form';
  const GENERATE_STORYBOOK_SCRIPT_KEY = 'generate_story_book_script';

  useEffect(() => {
    const generateStoryboardForm = localStorage.getItem(GENERATE_STORYBOOK_FORM_KEY);
    if (generateStoryboardForm) {
      setForm(JSON.parse(generateStoryboardForm));
    }

    const generateStoryboardScript = localStorage.getItem(GENERATE_STORYBOOK_SCRIPT_KEY);

    if (generateStoryboardScript) {
      setStoryboardScript(JSON.parse(generateStoryboardScript));
    }
  }, []);

  const updateFormField = (field: keyof GenerateStoryboardForm, value: string | number) => {
    setForm((prevForm) => {
      const updatedForm = {
        ...prevForm,
        [field]: value,
      };
      localStorage.setItem(GENERATE_STORYBOOK_FORM_KEY, JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const resetForm = () => {
    setForm(defaultFormValues);
  };

  const [storyboardScript, setStoryboardScript] = useState<StoryBoardInterface | undefined>();

  const [imagePrompts, setImagePrompts] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [generatingStoryboard, setGeneratingStoryboard] = useState(false);
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

  const generateStoryboardScriptPrompt = async () => {
    setGeneratingStoryboard(true);
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
      errorPolicy: 'all',
    });
    const script = response.data?.askChatCompletionAI.choices?.[0]?.message?.content;
    setStoryboardScript(script ? JSON.parse(script) : undefined);
    localStorage.setItem(GENERATE_STORYBOOK_SCRIPT_KEY, script || '');
    setGeneratingStoryboard(false);
  };

  const generateImagePrompts = async () => {
    setGeneratingImagePrompts(true);
    const imagePrompts: string[] = [];
    for (const panel of storyboardScript?.panels || []) {
      const response = await askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [
              {
                role: ChatCompletionRequestMessageRoleEnum.User,
                content: getGenerateImagesPrompt(JSON.stringify(panel), form.openAIImagePrompt),
              },
            ],
            n: 1,
          },
        },
        errorPolicy: 'all',
      });
      const openAIGeneratedPrompt = response.data?.askChatCompletionAI.choices?.[0]?.message?.content;
      imagePrompts.push(openAIGeneratedPrompt || '');
      setImagePrompts((prev) => (openAIGeneratedPrompt ? [...prev, openAIGeneratedPrompt] : [...prev]));
    }

    setImagePrompts((prev) => [...imagePrompts]);
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
        loading={generatingStoryboard}
        onClick={() => {
          setStoryboardScript(undefined);
          generateStoryboardScriptPrompt();
        }}
        variant="contained"
        primary
        className="mt-4"
      >
        Generate Storyboard Script
      </Button>

      {storyboardScript && (
        <>
          <div className="text-xs mt-6">
            <pre>{storyboardScript && JSON.stringify(storyboardScript, null, 2)}</pre>
          </div>
          <TextareaAutosize
            label="Open AI Image Prompt"
            id="openAIImagePrompt"
            autosize={true}
            modelValue={form.openAIImagePrompt}
            minHeight={100}
            onUpdate={(e) => {
              const contents = e?.toString() || '';
              updateFormField('openAIImagePrompt', contents);
            }}
            className="mt-6"
            placeholder={'Prompt that will be used to generate images for storyboard.'}
            infoText={'Prompt that will be used to generate images for storyboard.'}
          />
          <Button
            disabled={generatingImagePrompts}
            loading={generatingImagePrompts}
            onClick={generateImagePrompts}
            variant="contained"
            primary
            className="mt-4"
          >
            Generate Image Prompts
          </Button>
        </>
      )}

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
