'use client';

import { parseMarkdown } from '@/util/parse-markdown';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { Article } from './TickerNewsSection';
import { useState } from 'react';

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  article: Article;
}

function NewsModal({ open, onClose, article }: NewsModalProps): JSX.Element {
  return (
    <FullPageModal open={open} onClose={onClose} title={article.title} className="max-w-4xl">
      <div className="p-4">
        <span className="markdown-body text-sm" dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content ?? 'Not yet populated') }} />
      </div>
    </FullPageModal>
  );
}

export interface FullPageNewsButtonProps {
  article: Article;
}

export default function FullPageNewsButton({ article }: FullPageNewsButtonProps) {
  const [selectedNews, setSelectedNews] = useState<Article>();
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);

  return (
    <span>
      <Button
        removeBorder
        onClick={() => {
          setSelectedNews(article);
          setShowNewsModal(true);
        }}
        className="p-0"
      >
        View Full
      </Button>
      {showNewsModal && <NewsModal open={showNewsModal} onClose={() => setShowNewsModal(false)} article={selectedNews!} />}
    </span>
  );
}
