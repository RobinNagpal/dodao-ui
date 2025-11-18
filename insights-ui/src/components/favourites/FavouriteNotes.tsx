
interface FavouriteNotesProps {
  notes: string | null | undefined;
}

export default function FavouriteNotes({ notes }: FavouriteNotesProps) {
  if (!notes || notes.trim() === '') {
    return null;
  }

  return (
    <div className="mb-2">
      <p className="text-xs text-gray-500">
        My Notes: <span className="text-gray-300">{notes}</span>
      </p>
    </div>
  );
}
