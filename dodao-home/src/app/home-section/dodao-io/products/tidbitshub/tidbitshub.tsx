import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
  LightBulbIcon,
  PlayCircleIcon,
  CpuChipIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import ProductPage, { ProductPageContent } from '@/components/home/DoDAOHome/products/ProductPage';
import Tidbits from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';

const benefits = [
  {
    name: 'Enhanced Brand Reputation',
    href: '#',
    description: 'Position your company as a leader in innovative customer education, strengthening trust and credibility in your industry.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Lower Support Costs',
    href: '#',
    description: 'Reduce the volume of support queries by preemptively addressing common questions through interactive, self-service learning resources.',
    icon: BookOpenIcon,
  },
  {
    name: 'Improved Retention Rates',
    href: '#',
    description: 'Educated customers are more confident, leading to higher satisfaction and lower churn rates.',
    icon: HandRaisedIcon,
  },
];

const features = [
  {
    name: 'Bite-Sized Content (Tidbits)',
    description: 'Deliver micro-learning modules structured into 5-10 swipeable steps. Includes quizzes to reinforce learning and test comprehension.',
    icon: LightBulbIcon,
  },
  {
    name: 'Clickable Demos',
    description: 'Provide hands-on product simulations with step-by-step guidance, enabling users to understand functionalities without leaving the platform.',
    icon: CursorArrowRaysIcon,
  },
  {
    name: 'Short Videos',
    description: 'Engage users with concise, high-impact videos similar to Instagram Reels or YouTube Shorts for quick and effective learning.',
    icon: PlayCircleIcon,
  },
  {
    name: 'White-Labeled Sites',
    description: 'Fully customizable to align with your company’s branding and hosted on your domain for a seamless experience.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'Centralized Organization',
    description: 'Collections serve as a one-stop solution for all related content.',
    icon: ChartBarIcon,
  },
];

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'The objective of Tidbits Hub is to address the challenge of long-form content fatigue, which makes it tedious and overwhelming for customers to navigate through extensive material to find specific product features they are interested in. Long documents often complicate the onboarding process, leading to customer disengagement and product abandonment. Tidbits Hub was specifically designed to tackle this issue effectively.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/1270/1270380.png',
  },
  {
    name: 'The Solution',
    description:
      'Tidbits Hub provides a tailored platform that consolidates bite-sized content, interactive demos, and short videos into one seamless experience. It will help companies educate customers effectively, allowing them to grasp product knowledge in under 10-15 minutes.This solution is designed to mimic your company’s branding through white-labeled websites hosted on custom domains (e.g., https://tidbits.company.com). By structuring content into intuitive collections, we ensure users can quickly find and absorb key information without navigating complex documentation.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/8787/8787168.png',
  },
];

const content: ProductPageContent = {
  kind: 'Education',
  name: 'Tidbits Hub',
  lead: 'Bite-sized, interactive learning that helps companies educate their customers. Short steps, clickable demos and one-minute videos make complex product knowledge easy to grasp in minutes.',
  highlights: ['Bite-sized tidbits', 'Clickable demos', 'White-labeled sites'],
  primaryCta: { label: 'Get started', href: 'https://tidbitshub.org/' },
  secondaryCta: { label: 'See a live demo', href: 'https://alchemix.tidbitshub.org/' },
  preview: { image: Tidbits, alt: 'Tidbits Hub learning platform preview', url: 'tidbitshub.org' },
  story: {
    title: 'Why we built Tidbits Hub',
    lead: 'Long documents slow onboarding down. Tidbits Hub replaces them with short, focused lessons.',
    items: [
      { ...incentives[0], icon: FlagIcon },
      { ...incentives[1], icon: CpuChipIcon },
    ],
  },
  features: { title: 'Features', lead: 'Everything you need to teach a product in 10 to 15 minutes.', items: features },
  benefits: { title: 'Benefits for your company', items: benefits },
};

function TidbitsHubComponent() {
  return <ProductPage content={content} />;
}

export default TidbitsHubComponent;
