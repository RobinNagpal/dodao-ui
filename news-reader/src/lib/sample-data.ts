// Define explicit TypeScript interfaces for all data types

import { NewsArticle, NewsTopicFolder, NewsTopicTemplate, NewsTopic } from '@/lib/news-reader-types';

// Predefined templates
export const defaultTemplates: NewsTopicTemplate[] = [
  {
    id: 1,
    name: 'Technology Company',
    description: 'Track major technology companies',
    filters: ['Financial Changes', 'Product Launches', 'Core Management Changes', 'Partnership Announcements'],
    isDefault: true,
  },
  {
    id: 2,
    name: 'Startup Tracking',
    description: 'Monitor startup companies and funding',
    filters: ['Financial Changes', 'Partnership Announcements', 'Product Launches', 'Market Expansion'],
    isDefault: true,
  },
  {
    id: 3,
    name: 'Public Company',
    description: 'Track publicly traded companies',
    filters: ['Financial Changes', 'Regulatory Updates', 'Core Management Changes', 'Acquisition News'],
    isDefault: true,
  },
  {
    id: 4,
    name: 'Healthcare & Pharma',
    description: 'Monitor healthcare and pharmaceutical companies',
    filters: ['Regulatory Updates', 'Product Launches', 'Financial Changes', 'Legal Issues'],
    isDefault: true,
  },
  {
    id: 5,
    name: 'Cryptocurrency',
    description: 'Track cryptocurrency and blockchain projects',
    filters: ['Regulatory Updates', 'Technology Breakthroughs', 'Partnership Announcements', 'Market Expansion'],
    isDefault: true,
  },
];

// Default folders structure
export const defaultFolders: NewsTopicFolder[] = [
  {
    id: 1,
    name: 'Technology',
    parentId: null,
    children: [
      { id: 2, name: 'AI Companies', parentId: 1, children: [] },
      { id: 3, name: 'Hardware', parentId: 1, children: [] },
    ],
  },
  {
    id: 4,
    name: 'Finance',
    parentId: null,
    children: [
      { id: 5, name: 'Fintech', parentId: 4, children: [] },
      { id: 6, name: 'Traditional Banks', parentId: 4, children: [] },
    ],
  },
];

// Default topics
export const defaultTopics: NewsTopic[] = [
  {
    id: 1,
    topic: 'Tesla',
    description: 'Electric vehicle company news and updates',
    filters: ['Financial Changes', 'Core Management Changes'],
    templateUsed: 'Technology Company',
    folderId: 3, // Hardware folder
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    topic: 'OpenAI',
    description: 'AI research and product developments',
    filters: ['Product Launches', 'Financial Changes'],
    templateUsed: 'Startup Tracking',
    folderId: 2, // AI Companies folder
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    topic: 'Apple',
    description: 'Consumer technology and hardware updates',
    filters: ['Product Launches', 'Core Management Changes'],
    templateUsed: 'Technology Company',
    folderId: 3, // Hardware folder
    createdAt: '2024-01-08',
  },
];

// Sample news data
export const sampleNews: NewsArticle[] = [
  {
    id: 1,
    title: 'Tesla Reports Record Q4 Earnings, Stock Surges 12%',
    description: 'Tesla announced record quarterly earnings with revenue exceeding expectations, leading to significant stock price movement.',
    keyword: 'Tesla',
    filters: ['Financial Changes'],
    source: 'TechCrunch',
    publishedAt: '2024-01-20T10:30:00Z',
    url: '#',
    fullContent:
      "Tesla has announced record-breaking quarterly earnings for Q4, with revenue significantly exceeding Wall Street expectations. The electric vehicle manufacturer reported a 12% surge in stock price following the announcement. The company's automotive revenue increased by 21% year-over-year, driven by strong Model Y and Model 3 sales across global markets. Tesla's energy generation and storage business also saw substantial growth, with revenue up 32% compared to the same period last year. CEO Elon Musk highlighted the company's improved production efficiency and cost reductions as key factors in the strong financial performance. Analysts have responded positively to the results, with many raising their price targets for Tesla stock. The company also provided optimistic guidance for the upcoming year, projecting continued growth in vehicle deliveries despite ongoing supply chain challenges.",
    sources: [
      {
        title: 'Tesla Q4 Earnings Beat Expectations',
        url: 'https://techcrunch.com/tesla-earnings',
        source: 'TechCrunch',
        percentage: 45,
        publishedAt: '2024-01-20T09:00:00Z',
      },
      {
        title: 'Tesla Stock Surges After Strong Quarter',
        url: 'https://reuters.com/tesla-stock',
        source: 'Reuters',
        percentage: 35,
        publishedAt: '2024-01-20T10:15:00Z',
      },
      {
        title: 'Electric Vehicle Market Analysis',
        url: 'https://bloomberg.com/ev-market',
        source: 'Bloomberg',
        percentage: 20,
        publishedAt: '2024-01-20T11:30:00Z',
      },
    ],
  },
  {
    id: 2,
    title: 'OpenAI Launches GPT-5 with Enhanced Reasoning Capabilities',
    description: "The latest iteration of OpenAI's language model shows significant improvements in logical reasoning and problem-solving.",
    keyword: 'OpenAI',
    filters: ['Product Launches'],
    source: 'The Verge',
    publishedAt: '2024-01-19T14:15:00Z',
    url: '#',
    fullContent:
      'OpenAI has officially launched GPT-5, the latest version of its groundbreaking language model, featuring significant enhancements in reasoning capabilities and problem-solving. Early tests demonstrate that GPT-5 outperforms its predecessor across all benchmarks, with particularly notable improvements in logical reasoning, mathematical problem-solving, and nuanced understanding of complex instructions. The model shows a 40% reduction in hallucinations and factual errors compared to GPT-4, addressing one of the most significant limitations of previous versions. OpenAI researchers attribute these improvements to a new training methodology that emphasizes logical consistency and a vastly expanded knowledge base. The model also demonstrates enhanced capabilities in code generation, with improved accuracy and efficiency in writing complex software solutions. GPT-5 will be gradually rolled out to API customers over the coming weeks, with priority access given to research institutions and existing enterprise customers. The company has also announced plans for a more robust content moderation system to address potential misuse concerns.',
    sources: [
      {
        title: 'OpenAI Unveils GPT-5 with Revolutionary Reasoning Abilities',
        url: 'https://theverge.com/openai-gpt5-launch',
        source: 'The Verge',
        percentage: 50,
        publishedAt: '2024-01-19T13:00:00Z',
      },
      {
        title: 'GPT-5 Technical Specifications and Benchmarks',
        url: 'https://techcrunch.com/gpt5-specs',
        source: 'TechCrunch',
        percentage: 30,
        publishedAt: '2024-01-19T14:30:00Z',
      },
      {
        title: 'AI Language Models: Evolution and Capabilities',
        url: 'https://wired.com/ai-language-models',
        source: 'Wired',
        percentage: 20,
        publishedAt: '2024-01-18T16:45:00Z',
      },
    ],
  },
  {
    id: 3,
    title: 'Apple CEO Tim Cook Announces Succession Planning Initiative',
    description: 'Apple begins formal succession planning process as Tim Cook discusses long-term leadership transition strategy.',
    keyword: 'Apple',
    filters: ['Core Management Changes'],
    source: 'Bloomberg',
    publishedAt: '2024-01-18T09:45:00Z',
    url: '#',
    fullContent:
      "Apple CEO Tim Cook has formally announced the initiation of a comprehensive succession planning process, signaling the beginning of a carefully orchestrated leadership transition at the world's most valuable technology company. During a meeting with shareholders, Cook, who has led Apple since 2011, emphasized that while he has no immediate plans to step down, responsible governance requires a robust succession strategy. The company has established a special committee of board members to oversee the multi-year transition process, which will evaluate both internal and external candidates. Industry analysts have identified several key Apple executives as potential successors, including Chief Operating Officer Jeff Williams and Services chief Eddy Cue. The announcement comes as Apple continues to diversify its business beyond the iPhone, with growing emphasis on services and wearable technology. Cook stressed that the succession planning initiative is designed to ensure continuity of Apple's culture and values while positioning the company for its next phase of innovation and growth. The board has also engaged an executive search firm to assist with the process, though there is a strong preference for promoting from within, consistent with Apple's historical approach to leadership transitions.",
    sources: [
      {
        title: 'Tim Cook Initiates Apple Succession Planning',
        url: 'https://bloomberg.com/apple-succession',
        source: 'Bloomberg',
        percentage: 55,
        publishedAt: '2024-01-18T08:30:00Z',
      },
      {
        title: "Analysis: Who Could Be Apple's Next CEO?",
        url: 'https://wsj.com/apple-next-ceo',
        source: 'Wall Street Journal',
        percentage: 25,
        publishedAt: '2024-01-18T11:15:00Z',
      },
      {
        title: 'Corporate Succession Planning Best Practices',
        url: 'https://hbr.org/succession-planning',
        source: 'Harvard Business Review',
        percentage: 20,
        publishedAt: '2024-01-17T14:00:00Z',
      },
    ],
  },
  {
    id: 4,
    title: 'Tesla Expands Supercharger Network to 50,000 Stations Globally',
    description: 'Tesla reaches major milestone in charging infrastructure expansion across North America and Europe.',
    keyword: 'Tesla',
    filters: ['Market Expansion'],
    source: 'Reuters',
    publishedAt: '2024-01-17T16:20:00Z',
    url: '#',
    fullContent:
      "Tesla has achieved a significant milestone in its charging infrastructure development, announcing the completion of its 50,000th Supercharger station globally. This expansion represents a doubling of the network size in just under two years, highlighting the company's accelerated investment in charging infrastructure. The latest installations have focused on urban centers in Europe and strategic highway locations across North America, addressing key gaps in the network's coverage. Tesla's V4 Superchargers, which offer faster charging speeds and compatibility with non-Tesla vehicles in select markets, now account for approximately 30% of the total network. The company has also announced plans to manufacture Supercharger equipment in new facilities in Texas and Germany to support the continued expansion. This growth comes as Tesla works to maintain its competitive advantage in charging infrastructure amid increasing competition from other automakers and charging network operators. Industry analysts note that Tesla's integrated approach to vehicle and charging infrastructure development continues to provide a significant user experience advantage, with seamless integration between vehicles and charging stations. The company has reiterated its goal of reaching 100,000 Supercharger stations by the end of 2026.",
    sources: [
      {
        title: 'Tesla Hits 50,000 Supercharger Milestone',
        url: 'https://reuters.com/tesla-superchargers',
        source: 'Reuters',
        percentage: 40,
        publishedAt: '2024-01-17T15:00:00Z',
      },
      {
        title: 'EV Charging Infrastructure: Global Market Analysis',
        url: 'https://bloomberg.com/ev-charging-market',
        source: 'Bloomberg',
        percentage: 35,
        publishedAt: '2024-01-17T12:45:00Z',
      },
      {
        title: "Tesla's Supercharger Strategy Explained",
        url: 'https://electrek.co/tesla-supercharger-strategy',
        source: 'Electrek',
        percentage: 25,
        publishedAt: '2024-01-16T18:30:00Z',
      },
    ],
  },
  {
    id: 5,
    title: 'OpenAI Secures $10B Funding Round Led by Microsoft',
    description: 'Major funding round values OpenAI at $80 billion, with Microsoft increasing its stake in the AI company.',
    keyword: 'OpenAI',
    filters: ['Financial Changes'],
    source: 'Wall Street Journal',
    publishedAt: '2024-01-16T11:30:00Z',
    url: '#',
    fullContent:
      "OpenAI has successfully closed a massive $10 billion funding round, led by Microsoft, which values the artificial intelligence company at approximately $80 billion. This represents a dramatic increase from the company's previous valuation of $29 billion just one year ago, reflecting the explosive growth in demand for AI technologies and OpenAI's dominant position in the generative AI market. Microsoft, which has been a strategic partner since 2019, has significantly increased its stake in the company, though exact ownership percentages have not been disclosed. The funding will primarily be allocated to computing infrastructure expansion, with OpenAI planning to build multiple specialized AI data centers to support training of increasingly sophisticated models. The company has also earmarked funds for research into AI safety and alignment, addressing growing concerns about the potential risks of advanced AI systems. Other participants in the funding round include venture capital firms Sequoia Capital, Andreessen Horowitz, and Thrive Capital, along with several sovereign wealth funds. OpenAI CEO Sam Altman emphasized that the investment will enable the company to accelerate its research timeline while maintaining its commitment to developing AI that benefits humanity. Industry analysts note that this funding round solidifies OpenAI's position as the best-capitalized AI research company outside of tech giants like Google and Meta.",
    sources: [
      {
        title: 'OpenAI Raises $10 Billion in Funding Round Led by Microsoft',
        url: 'https://wsj.com/openai-funding',
        source: 'Wall Street Journal',
        percentage: 45,
        publishedAt: '2024-01-16T10:00:00Z',
      },
      {
        title: 'Microsoft Deepens AI Bet with Increased OpenAI Investment',
        url: 'https://ft.com/microsoft-openai',
        source: 'Financial Times',
        percentage: 30,
        publishedAt: '2024-01-16T12:30:00Z',
      },
      {
        title: 'Analysis: The Economics of AI Research and Development',
        url: 'https://economist.com/ai-economics',
        source: 'The Economist',
        percentage: 25,
        publishedAt: '2024-01-15T16:45:00Z',
      },
    ],
  },
  {
    id: 6,
    title: 'Apple Unveils Revolutionary AR Glasses at Developer Conference',
    description: "Apple's long-awaited augmented reality glasses feature advanced display technology and seamless iOS integration.",
    keyword: 'Apple',
    filters: ['Product Launches'],
    source: 'MacRumors',
    publishedAt: '2024-01-15T13:00:00Z',
    url: '#',
    fullContent:
      "Apple has finally unveiled its highly anticipated augmented reality glasses at its annual Worldwide Developers Conference, marking the company's first major new product category since the Apple Watch. The sleek device, officially named Apple Vision, features advanced micro-OLED display technology that delivers unprecedented resolution and brightness in a compact form factor resembling standard eyewear. The glasses seamlessly integrate with iOS devices, allowing users to view notifications, navigate maps, and interact with apps through a combination of eye tracking, voice commands, and subtle hand gestures. Apple has emphasized privacy in the design, with all spatial computing and image processing happening on-device rather than in the cloud. The product includes custom-designed Apple silicon specifically optimized for AR applications, providing up to 8 hours of battery life. During the demonstration, Apple showcased several compelling use cases, including immersive educational content, enhanced FaceTime calls with 3D avatars, and productivity applications that extend the Mac desktop into virtual space. The company also announced partnerships with major content creators and game developers to build a robust ecosystem of applications. The Apple Vision will be available in early 2025 with a starting price of $1,999, positioning it as a premium product aimed initially at early adopters and professionals.",
    sources: [
      {
        title: 'Apple Reveals AR Glasses at WWDC 2024',
        url: 'https://macrumors.com/apple-ar-glasses-reveal',
        source: 'MacRumors',
        percentage: 40,
        publishedAt: '2024-01-15T12:00:00Z',
      },
      {
        title: 'Hands-on with Apple Vision: First Impressions',
        url: 'https://theverge.com/apple-vision-hands-on',
        source: 'The Verge',
        percentage: 35,
        publishedAt: '2024-01-15T14:30:00Z',
      },
      {
        title: "Analysis: Apple's Entry into the AR Market",
        url: 'https://techcrunch.com/apple-ar-market-analysis',
        source: 'TechCrunch',
        percentage: 25,
        publishedAt: '2024-01-15T16:15:00Z',
      },
    ],
  },
];
