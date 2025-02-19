const posts = [
  {
    id: 1,
    title: 'Top 3 REITs to Watch This Quarter',
    href: '#',
    description: 'Discover how KoalaGains identifies undervalued REITs with potential for stable returns, analyzing rent flows and sector trends.',
    date: 'Feb 14, 2025',
    datetime: '2025-02-14',
    category: { title: 'Real Estate', href: '#' },
  },
  {
    id: 2,
    title: 'Designing AI Agents for Investor Reports',
    href: '#',
    description: 'A look under the hood: How we build specialized AI agents that generate actionable insights for growth, value, and dividend strategies.',
    date: 'Jan 8, 2025',
    datetime: '2025-01-08',
    category: { title: 'Innovation', href: '#' },
  },
  {
    id: 3,
    title: 'Private Credit and On-Chain Growth ETFs',
    href: '#',
    description: 'We explore how on-chain products go beyond T-Bills. Learn about the KoalaGains approach to bridging traditional finance with DeFi.',
    date: 'Dec 24, 2024',
    datetime: '2024-12-24',
    category: { title: 'Blockchain', href: '#' },
  },
];

export default function FromTheBlog() {
  // Feel free to adapt the content here to reflect real or hypothetical articles

  return (
    <div className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">From Our Blog</h2>
          <p className="mt-2 text-lg text-gray-400">Dive deeper into how KoalaGains is changing the investment landscape.</p>
        </div>

        {/* Posts grid */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.datetime} className="text-gray-500">
                  {post.date}
                </time>
                <a href={post.category.href} className="relative z-10 rounded-full bg-gray-700 px-3 py-1.5 font-medium text-gray-300 hover:bg-gray-600">
                  {post.category.title}
                </a>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-indigo-400">
                  <a href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm text-gray-400">{post.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
