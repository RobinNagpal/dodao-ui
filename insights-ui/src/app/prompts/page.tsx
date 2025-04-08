'use client';

import { PromptWithActiveVersion } from '@/app/api/[spaceId]/prompts/route';
import LoadingOrError from '@/components/core/LoadingOrError';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Helper function to truncate text to the first `wordLimit` words.
 */
function truncateText(text: string, wordLimit: number): string {
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(' ') + '...';
}

/**
 * Modal component to display the full notes.
 */
interface PromptNotesModalProps {
  open: boolean;
  onClose: () => void;
  notes: string;
}

function PromptNotesModal({ open, onClose, notes }: PromptNotesModalProps): JSX.Element {
  return (
    <FullPageModal open={open} onClose={onClose} title="Full Notes">
      <div className="p-4">
        <p>{notes}</p>
      </div>
    </FullPageModal>
  );
}

export default function PromptsListPage(): JSX.Element {
  const {
    data: prompts,
    loading,
    error,
  } = useFetchData<PromptWithActiveVersion[]>(`${getBaseUrl()}/api/koala_gains/prompts`, { cache: 'no-cache' }, 'Failed to fetch prompts.');
  const router = useRouter();
  const [filterText, setFilterText] = useState<string>('');
  const [selectedNote, setSelectedNote] = useState<string>('');
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);

  // Load the saved filter text from local storage on mount.
  useEffect(() => {
    const savedFilterText = localStorage.getItem('prompts_filter_text');
    if (savedFilterText !== null) {
      setFilterText(savedFilterText);
    }
  }, []);

  // Save filterText to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem('prompts_filter_text', filterText);
  }, [filterText]);

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  // Filter prompts based on the filter text provided by the user.
  const filteredPrompts =
    prompts?.filter((prompt) => {
      const lowerFilter = filterText.toLowerCase();
      return prompt.name.toLowerCase().includes(lowerFilter) || prompt.key.toLowerCase().includes(lowerFilter);
    }) || [];

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-4">All Prompts</h1>
        <div className="flex justify-end">
          <Button onClick={() => router.push('/prompts/create')} primary variant="contained">
            Create Prompt
          </Button>
        </div>
        {/* Filter input with help text. Yellow highlight is applied when filterText is not empty */}
        <div className="my-4">
          <Input
            modelValue={filterText}
            onUpdate={(val) => setFilterText(val as string)}
            helpText="Filter prompts by name or key"
            className={`w-full p-2 rounded ${filterText ? 'bg-yellow-200 text-black' : ''}`}
          >
            Filter Prompts
          </Input>
        </div>
        <table className="mt-4 w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border-color border">Name</th>
              <th className="text-left p-2 border-color border">Key</th>
              <th className="text-left p-2 border-color border">Notes</th>
              <th className="text-left p-2 border-color border">Active Version</th>
              <th className="text-left p-2 border-color border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.map((prompt) => (
              <tr key={prompt.id} className="border border-color">
                <td className="p-2 border border-color">{prompt.name}</td>
                <td className="p-2 border border-color">{prompt.key}</td>
                <td className="p-2 border border-color">
                  {prompt.notes ? (
                    <>
                      {truncateText(prompt.notes, 20)}{' '}
                      {prompt.notes.split(/\s+/).length > 20 && (
                        <button
                          onClick={() => {
                            setSelectedNote(prompt.notes || 'No Notes');
                            setShowNotesModal(true);
                          }}
                          className="text-blue-500 underline"
                        >
                          View Full
                        </button>
                      )}
                    </>
                  ) : (
                    'No notes added'
                  )}
                </td>
                <td className="p-2 border border-color">
                  {prompt.activePromptVersion?.version ? (
                    <>
                      Version: {prompt.activePromptVersion?.version}
                      <br />
                      Commit: {prompt.activePromptVersion?.commitMessage}
                    </>
                  ) : (
                    <>No active version</>
                  )}
                </td>
                <td className="p-2 border border-color">
                  <div className="flex flex-col">
                    <Link href={`/prompts/${prompt.id}`} className="link-color underline mr-4">
                      View
                    </Link>
                    <Link href={`/prompts/edit/${prompt.id}`} className="link-color underline mr-4">
                      Edit
                    </Link>
                    <Link href={`/prompts/${prompt.id}/invocations`} className="link-color underline">
                      Invocations
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showNotesModal && <PromptNotesModal open={showNotesModal} onClose={() => setShowNotesModal(false)} notes={selectedNote} />}
    </PageWrapper>
  );
}
