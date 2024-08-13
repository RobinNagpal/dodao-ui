import { EditByteType } from '@/components/bytes/Edit/editByteHelper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { NotificationProps } from '@dodao/web-core/components/core/notify/Notification';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, DownloadAndCleanContentResponse } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { sum } from 'lodash';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import geneateBytePrompt from './generateBytePrompt';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState<string>();
  const [contents, setContents] = useState<string>();

  const { showNotification } = useNotificationContext();
  const handleShowNotification = (notificationProps: NotificationProps) => {
    showNotification(notificationProps);
  };

  const generateByteContent = async (): Promise<string | undefined> => {
    const cleanContents = await axios.post(`${getBaseUrl()}/api/openAI/download-and-clean-content`, {
      input: contents,
    });

    const cleanContentResponse: DownloadAndCleanContentResponse = cleanContents.data?.downloadAndCleanContent;
    const links = cleanContentResponse?.links;
    const tokenCount = (links?.length || 0) > 0 ? sum(links?.map((link) => link?.tokenCount || 0)) : 0;
    const cleanedContentText = cleanContentResponse?.content!;

    if (!cleanedContentText) {
      setLoading(false);
      setError('Please enter valid content');
      return;
    }

    if (tokenCount && tokenCount > 12000) {
      setLoading(false);
      setError('Please enter less content');
      return;
    }

    const inputContent = geneateBytePrompt(topic!, cleanedContentText);

    const response = await axios.post('/api/openAI/ask-chat-completion-ai', {
      input: {
        messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
      },
      model: 'gpt-4',
    });

    const data = await response?.data?.completion?.choices?.[0]?.message?.content;

    return data || undefined;
  };

  const generateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateByteContent();

      if (!data) {
        return;
      }

      const parsedArray = JSON.parse(data) as GeneratedByte[];
      const parsedData = parsedArray[0];

      const steps = parsedData.steps.map((step) => ({ ...step, uuid: uuidv4(), stepItems: [] }));

      const editByteType: EditByteType = {
        ...parsedData,
        admins: [],
        byteExists: false,
        created: new Date().toISOString(),
        isPristine: true,
        priority: 0,
        tags: [],
        steps: steps,
      };
      setLoading(false);

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
    <FullPageModal open={open} onClose={onClose} title="Create Tidbit Using AI">
      <div className="text-left	">
        <div className=" container  mx-auto p-4 flex flex-col ">
          <TextareaAutosize
            label="Topic"
            id="topic"
            autosize={true}
            modelValue={topic}
            onUpdate={(e) => setTopic(e?.toString() || '')}
            className="mt-2"
            maxHeight={150}
            placeholder={'Just mention a sentence or two about the topic of the Tidbit'}
          />
          <TextareaAutosize
            label="Content"
            id="content"
            autosize={true}
            modelValue={contents}
            minHeight={250}
            onUpdate={(e) => setContents(e?.toString() || '')}
            className="mt-2"
            placeholder={'Enter all the content and the links from where you want to generate the Tidbit'}
          />
          {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}
          <Button
            loading={loading}
            disabled={!topic?.trim() || !contents?.trim()}
            onClick={() => generateResponse()}
            variant="contained"
            primary
            className="mt-4"
          >
            Generate Using AI
          </Button>{' '}
        </div>
      </div>
    </FullPageModal>
  );
}
