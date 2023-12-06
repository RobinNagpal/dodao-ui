import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import CategoryCheckboxes from '@/components/spaces/Loaders/Discourse/CategoryCheckboxes';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatbotFaqFragment, SpaceWithIntegrationsFragment, useChatbotCategoriesQuery, useUpsertChatbotFaqMutation } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export default function UpsertChatbotFAQModal({
  open,
  onClose,
  faq,
  space,
}: {
  open: boolean;
  onClose: () => void;
  faq: ChatbotFaqFragment | null;
  space: SpaceWithIntegrationsFragment;
}) {
  const { data: categoriesResponse } = useChatbotCategoriesQuery({
    variables: {
      spaceId: space.id,
    },
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(faq?.categories || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(faq?.subCategories || []);

  const [upsertChatbotFaqMutation] = useUpsertChatbotFaqMutation({});

  const [upserting, setUpserting] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>(faq?.question || '');
  const [answer, setAnswer] = useState<string>(faq?.answer || '');
  const [priority, setPriority] = useState<number>(faq?.priority || 50);
  const [url, setUrl] = useState<string>(faq?.url || '');

  const { showNotification } = useNotificationContext();

  useEffect(() => {
    setSelectedCategories(faq?.categories || []);
    setSelectedSubCategories(faq?.subCategories || []);
  }, [faq]);

  const upsertChatbotFaq = async () => {
    setUpserting(true);
    await upsertChatbotFaqMutation({
      variables: {
        spaceId: space.id,
        input: {
          id: faq?.id || v4(),
          categories: selectedCategories,
          subCategories: selectedSubCategories,
          answer,
          question,
          spaceId: space.id,
          priority: 50,
          url,
        },
      },
      refetchQueries: ['ChatbotFAQs'],
    });
    onClose();
    setUpserting(false);
    showNotification({ message: 'FAQ upserted', type: 'success' });
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title="Chatbot FAQs">
      <div className="ml-6 p-4 text-left">
        <div className="mb-6">Upsert Chatbot FAQ</div>
        <div className="my-4">
          <MarkdownEditor
            id={faq?.id + '_question'}
            label="Question"
            modelValue={question}
            placeholder="Question"
            maxHeight={100}
            onUpdate={(content) => setQuestion(content)}
            spaceId={space.id}
            objectId={`chatbot/faqs/question/${faq?.id || 'new-faq'}`}
            imageType="FAQ"
          />
          <MarkdownEditor
            id={faq?.id + '_answer'}
            label="Answer"
            modelValue={answer}
            placeholder="Answer"
            maxHeight={100}
            onUpdate={(content) => setAnswer(content)}
            spaceId={space.id}
            objectId={`chatbot/faqs/answer/${faq?.id || 'new-faq'}`}
            imageType="FAQ"
          />

          <Input modelValue={url} onUpdate={(e) => setUrl(e?.toString() || '')} className="mb-4" label="Url" />

          <Input modelValue={priority} onUpdate={(e) => setPriority(parseInt(e?.toString() || '50'))} className="mb-4" label="Priority" />

          <CategoryCheckboxes
            categories={categoriesResponse?.chatbotCategories || []}
            setSelectedCategories={setSelectedCategories}
            setSelectedSubCategories={setSelectedSubCategories}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
          />
        </div>
        <Button
          disabled={question.length < 5 || answer.length < 5 || url.length < 5}
          onClick={() => upsertChatbotFaq()}
          loading={upserting}
          variant="contained"
          primary
          className="mt-4"
        >
          Upsert
        </Button>
      </div>
    </FullScreenModal>
  );
}
