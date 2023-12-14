import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ArticleIndexingInfoFragment, useCreateArticleIndexingInfoMutation, useEditArticleIndexingInfoMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export interface UpsertArticleIndexingModalProps {
  open: boolean;
  articleIndexingInfo?: ArticleIndexingInfoFragment;
  onClose: () => void;
  spaceId: string;
}
export default function UpsertArticleIndexingInfoModal({ open, spaceId, onClose, articleIndexingInfo }: UpsertArticleIndexingModalProps) {
  const [articleUrl, setArticleUrl] = useState(articleIndexingInfo?.articleUrl);

  const [createArticleIndexingMutation] = useCreateArticleIndexingInfoMutation();
  const [editArticleIndexingMutation] = useEditArticleIndexingInfoMutation();

  return (
    <FullPageModal open={open} onClose={onClose} title={'Space Loaders'}>
      <div className="text-left">
        <div className="m-4 space-y-2">
          <Input label={'Scraping Start Url'} onUpdate={(repoUrl) => setArticleUrl(repoUrl?.toString())} modelValue={articleUrl} />
          <Button
            onClick={async () => {
              if (!articleUrl) return;

              if (articleIndexingInfo) {
                await editArticleIndexingMutation({
                  variables: {
                    articleIndexingInfoId: articleIndexingInfo.id,
                    spaceId,

                    articleUrl: articleUrl?.trim(),
                  },
                  refetchQueries: ['ArticleIndexingInfos'],
                });
              } else {
                await createArticleIndexingMutation({
                  variables: {
                    spaceId,
                    articleUrl: articleUrl?.trim(),
                  },
                  refetchQueries: ['ArticleIndexingInfos'],
                });
              }
              onClose();
            }}
            variant="contained"
            primary
          >
            Upsert
          </Button>
        </div>
      </div>
    </FullPageModal>
  );
}
