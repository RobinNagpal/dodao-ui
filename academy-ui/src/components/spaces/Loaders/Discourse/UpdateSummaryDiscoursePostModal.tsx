import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Datepicker from '@dodao/web-core/components/core/datepicker/Datepicker';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { DiscoursePost, useUpsertSummaryOfDiscoursePostMutation } from '@/graphql/generated/generated-types';
import React, { useEffect, useState } from 'react';
import styles from './UpdateSummaryDiscoursePostModal.module.scss';
export default function UpdateSummaryDiscoursePostModal({
  open,
  onClose,
  post,
  space,
}: {
  open: boolean;
  onClose: () => void;
  post: DiscoursePost;
  space: SpaceWithIntegrationsDto;
}) {
  const [upsertSummaryOfDiscoursePostMutation] = useUpsertSummaryOfDiscoursePostMutation();

  const [upserting, setUpserting] = useState<boolean>(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryDate, setAiSummaryDate] = useState<string | null>(null);

  useEffect(() => {
    setAiSummary(post.aiSummary || null);
    setAiSummaryDate(post.aiSummaryDate || null);
  }, [post]);

  const annotate = async () => {
    setUpserting(true);
    await upsertSummaryOfDiscoursePostMutation({
      variables: {
        spaceId: space.id,
        input: {
          postId: post.id,
          aiSummary: aiSummary,
          aiSummaryDate: aiSummaryDate,
        },
      },
      refetchQueries: ['DiscoursePosts'],
    });
    onClose();
    setUpserting(false);
  };

  return (
    <FullPageModal open={open} onClose={onClose} title="Add Summary of Discourse Post">
      <div className={'ml-6 p-4 min-h-screen text-left ' + styles.upsertSummaryModalHeight}>
        <div className="mb-6">Add summary - {post.title} </div>
        <div className="my-4">
          <div className="mt-4" />
          <Datepicker
            date={aiSummaryDate ? new Date(aiSummaryDate) : new Date()}
            label={`Summary Date *`}
            onChange={(date) => {
              setAiSummaryDate(date?.toISOString() || new Date().toISOString());
            }}
          />

          <TextareaAutosize
            label="Ai Summary"
            id={post.id + '-ai-summary'}
            modelValue={aiSummary || ''}
            placeholder="Ai Summary"
            onUpdate={(e) => setAiSummary(e ? e.toString() : '')}
            rows={15}
            className={'mt-4 ' + styles.summaryTextarea}
          />
        </div>
        <Button disabled={false} onClick={() => annotate()} loading={false} variant="contained" primary className="mt-4">
          Annotate
        </Button>
      </div>
    </FullPageModal>
  );
}
