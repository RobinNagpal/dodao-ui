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
      <p className="text-xs text-gray-500 mb-1">My Notes:</p>
      <div className="text-xs text-gray-300 line-clamp-2 markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(notes) }} />
    </div>
  );
}
