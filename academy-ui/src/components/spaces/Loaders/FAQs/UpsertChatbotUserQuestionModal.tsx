import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  ChatbotUserQuestionFragment,
  ImageType,
  SpaceWithIntegrationsFragment,
  useChatbotCategoriesQuery,
  useUpsertChatbotUserQuestionMutation,
} from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import { v4 } from 'uuid';

export default function UpsertChatbotUserQuestionModal({
  open,
  onClose,
  userQuestion,
  space,
}: {
  open: boolean;
  onClose: () => void;
  userQuestion: ChatbotUserQuestionFragment | null;
  space: SpaceWithIntegrationsFragment;
}) {
  const { data: categoriesResponse } = useChatbotCategoriesQuery({
    variables: {
      spaceId: space.id,
    },
  });

  const [upsertChatbotUserQuestionMutation] = useUpsertChatbotUserQuestionMutation({});

  const [upserting, setUpserting] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>(userQuestion?.question || '');

  const { showNotification } = useNotificationContext();

  const upsertChatbotUserQuestion = async () => {
    setUpserting(true);
    await upsertChatbotUserQuestionMutation({
      variables: {
        spaceId: space.id,
        input: {
          id: userQuestion?.id || v4(),
          question,
          spaceId: space.id,
        },
      },
      refetchQueries: ['ChatbotUserQuestions'],
    });
    onClose();
    setUpserting(false);
    showNotification({ message: 'UserQuestion upserted', type: 'success' });
  };

  return (
    <FullPageModal open={open} onClose={onClose} title="Annotate User Question">
      <div className="ml-6 p-4 text-left">
        <div className="mb-6">Upsert Chatbot UserQuestion</div>
        <div className="my-4">
          <MarkdownEditor
            id={userQuestion?.id + '_question'}
            label="Question"
            modelValue={question}
            placeholder="Question"
            maxHeight={100}
            onUpdate={(content) => setQuestion(content)}
            spaceId={space.id}
            objectId={`chatbot/userQuestions/question/${userQuestion?.id || 'new-userQuestion'}`}
            imageType={ImageType.Space}
          />
        </div>
        <Button disabled={question.length < 5} onClick={() => upsertChatbotUserQuestion()} loading={upserting} variant="contained" primary className="mt-4">
          Upsert
        </Button>
      </div>
    </FullPageModal>
  );
}
