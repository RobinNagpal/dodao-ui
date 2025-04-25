'use client';

import { parseMarkdown } from '@/util/parse-markdown';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useState } from 'react';

interface Article {
  date: string;
  title: string;
  content: string;
}

export interface TickerNewsSectionProps {
  articles: Article[];
}

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  article: Article;
}

function NewsModal({ open, onClose, article }: NewsModalProps): JSX.Element {
  return (
    <FullPageModal open={open} onClose={onClose} title={article.title} className="max-w-4xl">
      <div className="p-4">
        <span className="markdown-body text-sm" dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content) }} />
      </div>
    </FullPageModal>
  );
}

export default function TickerNewsSection({ articles }: TickerNewsSectionProps) {
  const [selectedNews, setSelectedNews] = useState<Article>();
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);

  function truncateText(text: string, wordLimit: number): string {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((a, i) => (
        <div key={i} className="block-bg-color border border-color rounded-lg shadow-sm p-4 flex flex-col justify-between text-left">
          <div>
            <div className="text-sm mb-2">{a.date}</div>
            <h3 className="font-semibold mb-2">{a.title}</h3>
          </div>
          <div className="text-sm">
            {truncateText(a.content, 40)}{' '}
            {a.content.split(/\s+/).length > 40 && (
              <button
                onClick={() => {
                  setSelectedNews(a);
                  setShowNewsModal(true);
                }}
                className="link-color underline"
              >
                View Full
              </button>
            )}
          </div>
          {showNewsModal && <NewsModal open={showNewsModal} onClose={() => setShowNewsModal(false)} article={selectedNews!} />}
        </div>
      ))}
    </div>
  );
}
