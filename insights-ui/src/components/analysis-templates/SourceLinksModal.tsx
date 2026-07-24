'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { SourceLink } from '@/types/prismaTypes';
import { LinkIcon } from '@heroicons/react/24/outline';

interface SourceLinksModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sources: SourceLink[];
}

export default function SourceLinksModal({ open, onClose, title, sources }: SourceLinksModalProps) {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-center gap-2">
          <LinkIcon className="w-4 h-4 text-link" />
          <span>{title}</span>
        </div>
      }
      className="w-full max-w-4xl"
    >
      <div className="px-6 py-2">
        <div className="mb-4">
          <p className="text-muted text-sm text-center">
            Information sourced from web search results ({sources.length} source{sources.length !== 1 ? 's' : ''})
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="space-y-2">
            {sources.map((source: SourceLink, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-text text-sm font-medium rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:text-link underline hover:no-underline transition-colors"
                >
                  {source.title || 'Untitled Source'}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted italic text-center">
            These sources were used to generate the analysis. Click on any link to view the original content.
          </p>
        </div>
      </div>
    </FullPageModal>
  );
}
