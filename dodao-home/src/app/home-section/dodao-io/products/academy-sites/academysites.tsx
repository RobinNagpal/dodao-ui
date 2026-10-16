import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  LightBulbIcon,
  CpuChipIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import ProductPage, { ProductPageContent } from '@/components/home/DoDAOHome/products/ProductPage';
import AcademySites from '@/images/DoDAOHomePage/Academy_site.gif';

const benefits = [
  {
    name: 'Accelerated Learning',
    href: '#',
    description: 'Comprehensive tutorials that offer in-depth explanations on various topics, enabling users to understand complex subjects thoroughly.',
    icon: BoltIcon,
  },
  {
    name: 'Hands-On Experience',
    href: '#',
    description: 'Concise content pieces designed to convey essential information quickly, allowing learners to grasp key points efficiently.',
    icon: HandRaisedIcon,
  },
  {
    name: 'Tailored Learning Styles',
    href: '#',
    description: 'Interactive simulations that provide hands-on experience, helping users to better understand and engage with the material.',
    icon: AdjustmentsHorizontalIcon,
  },
];

const features = [
  {
    name: 'Guides',
    description: 'Comprehensive tutorials that offer in-depth explanations on various topics, enabling users to understand complex subjects thoroughly.',
    icon: BookOpenIcon,
  },
  {
    name: 'Tidbits',
    description: 'Concise content pieces designed to convey essential information quickly, allowing learners to grasp key points efficiently.',
    icon: LightBulbIcon,
  },
  {
    name: 'Clickable Demos',
    description: 'Interactive simulations that provide hands-on experience, helping users to better understand and engage with the material.',
    icon: CursorArrowRaysIcon,
  },
  {
    name: 'Courses',
    description:
      'Structured educational programs that integrate texts, diagrams, videos, and interactive questions, facilitating a comprehensive learning experience.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Progress Tracking',
    description:
      'A simple tool that monitors completed modules and future lessons, keeping learners motivated and ensuring a clear path to mastering new skills.',
    icon: ChartBarIcon,
  },
];

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'The primary goal of Academy Sites is to make blockchain education accessible, concise, and engaging for users of all skill levels.Traditional learning methods often overwhelm learners with fragmented or overly technical content, making it challenging to grasp the core functionalities of platforms like Arbitrum and Uniswap. Academy sites address this challenge in a very effective way.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/1270/1270380.png',
  },
  {
    name: 'The Solution',
    description:
      'Academy Sites provide a structured, interactive, and user-friendly learning environment. By combining detailed guides, bite-sized tidbits, clickable demos, and short videos, the platform caters to diverse learning styles and preferences. These sites align with the branding of their respective platforms, ensuring a consistent user experience, while delivering high-impact educational content that simplifies blockchain technology.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/8787/8787168.png',
  },
];

const content: ProductPageContent = {
  kind: 'Education',
  name: 'Academy Sites',
  lead: 'Tailored, interactive learning sites with guides, tidbits, demos and videos. They make complex platforms like Arbitrum and Uniswap easy to learn, in the platform’s own branding.',
  highlights: ['Guides and nano-courses', 'Clickable demos', 'Your branding and domain'],
  primaryCta: { label: 'Get started', href: 'mailto:info@dodao.com?subject=Academy%20Sites' },
  secondaryCta: { label: 'See a live demo', href: 'https://uniswap.university/' },
  preview: { image: AcademySites, alt: 'Academy Sites learning platform preview', url: 'uniswap.university' },
  story: {
    title: 'Why we built Academy Sites',
    lead: 'Fragmented, overly technical material loses learners. Academy Sites give them one structured place to learn.',
    items: [
      { ...incentives[0], icon: FlagIcon },
      { ...incentives[1], icon: CpuChipIcon },
    ],
  },
  features: { title: 'Features', lead: 'Different formats for different learning styles, in one site.', items: features },
  benefits: { title: 'Benefits for your community', items: benefits },
};

function AcademySitesComponent() {
  return <ProductPage content={content} />;
}

export default AcademySitesComponent;
