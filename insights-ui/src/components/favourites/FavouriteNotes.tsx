import { parseMarkdown } from '@/util/parse-markdown';

interface FavouriteNotesProps {
  notes: string | null | undefined;
}

export default function FavouriteNotes({ notes }: FavouriteNotesProps) {
  if (!notes || notes.trim() === '') {
    return null;
  }

  return (
    <div className="mb-2">
      <h2 className="text-md font-medium text-gray-400 mb-1">Notes:</h2>
      <p className="text-xs text-gray-500">
        <div className="markdown markdown-body text-sm" dangerouslySetInnerHTML={{ __html: parseMarkdown(notes ?? 'No notes added.') }} />
      </p>
    </div>
  );
}
