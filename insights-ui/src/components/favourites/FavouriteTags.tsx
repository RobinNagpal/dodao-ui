import { UserTickerTagResponse } from '@/types/ticker-user';

interface FavouriteTagsProps {
  tags: UserTickerTagResponse[];
}

export default function FavouriteTags({ tags }: FavouriteTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full text-white font-medium"
          style={{ backgroundColor: tag.colorHex }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
