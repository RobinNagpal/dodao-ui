import UnstyledTextareaAutosize from '@/components/core/textarea/UnstyledTextareaAutosize';
import { testTidbitContentString, testTiditTopicString } from '@/components/bytes/Create/testTidbitContentString';
import { EditByteType } from '@/components/bytes/Edit/useEditByte';
import LoadingSpinner from '@/components/core/loaders/LoadingSpinner';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { NotificationProps } from '@/components/core/notify/Notification';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  AskChatCompletionAiMutation,
  ChatCompletionRequestMessageRoleEnum,
  useAskChatCompletionAiMutation,
  useDownloadAndCleanContentMutation,
  useExtractRelevantTextForTopicMutation,
} from '@/graphql/generated/generated-types';
import { PublishStatus, VisibilityEnum } from '@/types/deprecated/models/enums';
import { FetchResult } from '@apollo/client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import geneateBytePrompt from './generateBytePrompt';

export interface CreateByteUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateByte: (byte: EditByteType) => void;
}

export interface GeneratedByte {
  id: string;
  name: string;
  content: string;
  steps: { name: string; content: string }[];
}
export function CreateByteUsingAIModal(props: CreateByteUsingAIModalProps) {
  const { open, onClose, onGenerateByte } = props;

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('Generate response');
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [downloadAndCleanContentMutation] = useDownloadAndCleanContentMutation();

  const [topic, setTopic] = useState<string>(testTiditTopicString);
  const [contents, setContents] = useState<string>(testTidbitContentString);
  const [response, setResponse] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  const { showNotification } = useNotificationContext();
  const handleShowNotification = (notificationProps: NotificationProps) => {
    showNotification(notificationProps);
  };

  const generateResponse = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse('');
    setLoading(true);
    if (!e) {
      return;
    }

    try {
      const cleanContents = await downloadAndCleanContentMutation({
        variables: {
          input: contents,
        },
      });

      const inputContent = geneateBytePrompt(topic, cleanContents.data?.downloadAndCleanContent.text!);

      console.log('inputContent', inputContent);
      const responsePromise = askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
            model: 'gpt-3.5-turbo-16k',
          },
        },
      });

      const timeoutDuration = 50000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutDuration);
      });

      const response = (await Promise.race([responsePromise, timeoutPromise])) as FetchResult<AskChatCompletionAiMutation>;

      const data = await response.data?.askChatCompletionAI.choices?.[0]?.message?.content;

      if (!data) {
        throw new Error(JSON.stringify(response));
      }

      const parsedData = JSON.parse(data) as GeneratedByte;
      setLoaded(true);

      setResponse(data);
      setLoading(false);
      setText('Generated');
      const editByteType: EditByteType = {
        ...parsedData,
        admins: [],
        byteExists: false,
        created: new Date().toISOString(),
        isPristine: true,
        priority: 0,
        publishStatus: PublishStatus.Draft,
        visibility: VisibilityEnum.Public,
        tags: [],
        steps: parsedData.steps.map((step) => ({ ...step, uuid: uuidv4(), stepItems: [] })),
      };

      if (parsedData?.id) {
        onGenerateByte(editByteType);
        onClose();
      } else {
        handleShowNotification({
          heading: 'Error',
          type: 'error',
          message: 'The Tidbit Was not generated properly either the content given was inappropriate or server issue please try again later ',
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      handleShowNotification({ heading: 'TimeOut Error', type: 'error', message: 'This request Took More time then Expected Please Try Again' });
    }
  };
  return (
    <FullScreenModal open={open} onClose={onClose} title="Create Byte Using AI">
      <div className=" md:ml-20">
        <div className=" container  mx-auto p-4 flex flex-col ">
          <h1 className="md:text-5xl text-4xl text-[#9291cd] font-semibold mb-10">Create Tidbits Via AI </h1>
          <UnstyledTextareaAutosize
            autosize={true}
            modelValue={topic}
            onUpdate={(e) => setTopic(e?.toString() || '')}
            className="border-solid border-2 border-[#9291cd]"
            maxHeight={200}
            placeholder={'Just mention a sentence or two about the topic of the Tidbit'}
          />

          <UnstyledTextareaAutosize
            autosize={true}
            modelValue={contents}
            minHeight={400}
            onUpdate={(e) => setContents(e?.toString() || '')}
            className="border-solid border-2 mt-4 border-[#9291cd]"
            placeholder={'Enter all the content and the links from where you want to generate the Tidbit'}
          />
          {!loading ? (
            <button
              className="mt-5 md:w-[40%] w-[50%] rounded-xl bg-[#9291cd] px-4 py-2 font-medium text-white/80 hover:b hover:text-white hover:border-white"
              onClick={(e) => generateResponse(e)}
            >
              {text} &rarr;
            </button>
          ) : (
            <button
              disabled
              className="mt-5 md:w-[40%] w-[50%] rounded-xl bg-[#9291cd] px-4 py-2 font-medium text-white/80 hover:b hover:text-white hover:border-white"
            >
              <div className="flex flex-row justify-around">
                <div className="animate-pulse font-lg tracking-widest ">AI is generating... </div> <LoadingSpinner />{' '}
              </div>
            </button>
          )}
        </div>
      </div>
    </FullScreenModal>
  );
}
