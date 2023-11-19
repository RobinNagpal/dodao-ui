import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import CategoryCheckboxes from '@/components/spaces/Loaders/Discourse/CategoryCheckboxes';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ChatbotUserQuestionFragment,
  SpaceWithIntegrationsFragment,
  useChatbotCategoriesQuery,
  useUpsertChatbotUserQuestionMutation,
} from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
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

  const [selectedCategories, setSelectedCategories] = useState<string[]>(userQuestion?.categories || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(userQuestion?.subCategories || []);

  const [upsertChatbotUserQuestionMutation] = useUpsertChatbotUserQuestionMutation({});

  const [upserting, setUpserting] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>(userQuestion?.question || '');

  const { showNotification } = useNotificationContext();

  useEffect(() => {
    setSelectedCategories(userQuestion?.categories || []);
    setSelectedSubCategories(userQuestion?.subCategories || []);
  }, [userQuestion]);

  const upsertChatbotUserQuestion = async () => {
    setUpserting(true);
    await upsertChatbotUserQuestionMutation({
      variables: {
        spaceId: space.id,
        input: {
          id: userQuestion?.id || v4(),
          categories: selectedCategories,
          subCategories: selectedSubCategories,
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
    <FullScreenModal open={open} onClose={onClose} title="Annotate User Question">
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
            imageType="UserQuestion"
          />

          <CategoryCheckboxes
            categories={categoriesResponse?.chatbotCategories || []}
            setSelectedCategories={setSelectedCategories}
            setSelectedSubCategories={setSelectedSubCategories}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
          />
        </div>
        <Button disabled={question.length < 5} onClick={() => upsertChatbotUserQuestion()} loading={upserting} variant="contained" primary className="mt-4">
          Upsert
        </Button>
      </div>
    </FullScreenModal>
  );
}
