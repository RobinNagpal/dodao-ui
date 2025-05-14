import FullPageNewsButton from './FullPageNewsButton';

export interface Article {
  date: string;
  title: string;
  content: string;
}

export interface TickerNewsSectionProps {
  articles: Article[];
}

export default function TickerNewsSection({ articles }: TickerNewsSectionProps) {
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
            {truncateText(a.content, 40)} {a.content.split(/\s+/).length > 40 && <FullPageNewsButton article={a} />}
          </div>
        </div>
      ))}
    </div>
  );
}
