import { parseMarkdown } from '@/util/parse-markdown';

interface FavouriteNotesProps {
  notes: string | null | undefined;
}

export default function FavouriteNotes({ notes }: FavouriteNotesProps) {
  if (!notes || notes.trim() === '') {
    return null;
  }

  return (
    <div className="mb-1.5">
      <h5 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Notes</h5>
      <div className="text-sm text-gray-300">
        <div className="markdown markdown-body leading-snug" dangerouslySetInnerHTML={{ __html: parseMarkdown(notes ?? 'No notes added.') }} />
      </div>
    </div>
  );
}
