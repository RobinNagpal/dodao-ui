import Image from 'next/image';

import { Container } from '@/components/HomePage/components/Container';
import createCustomRubricImage from '@/components/HomePage/images/create-custom-rubric.png';
import gatherFeedbackImage from '@/components/HomePage/images/gather-feedback.png';
import analyticsImage from '@/components/HomePage/images/analytics.png';

const resources = [
  {
    title: 'Create Custom Rubrics',
    description: 'Design detailed evaluation rubrics tailored to your specific needs.',
    image: function CreateCustomRubricImage() {
      return <Image src={createCustomRubricImage} layout="fill" objectFit="cover" alt="Create Custom Rubric" />;
    },
  },
  {
    title: 'Gather Feedback',
    description: 'Collect precise and actionable feedback effortlessly through our user-friendly interface.',
    image: function GatherFeedbackImage() {
      return <Image src={gatherFeedbackImage} layout="fill" objectFit="cover" alt="Gather Feedback" />;
    },
  },
  {
    title: 'Review and Improve',
    description: 'Gain deep insights with comprehensive reports and analytics to make informed decisions.',
    image: function AnalyticsImage() {
      return <Image src={analyticsImage} layout="fill" objectFit="cover" alt="Analytics" />;
    },
  },
];

export default function Resources() {
  return (
    <section id="resources" aria-labelledby="resources-title" className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32">
      <Container>
        <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-900 text-center" style={{ color: 'var(--primary-color)' }}>
          How giving feedback with Rubric works
        </h1>
      </Container>
      <Container className="mt-16">
        <ol role="list" className="-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20">
          {resources.map((resource) => (
            <li key={resource.title} className="grid auto-rows-min grid-cols-1 items-center gap-8 px-3 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-1 xl:px-12">
              <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40">
                <resource.image />
              </div>
              <div>
                <h3 className="text-base font-medium tracking-tight text-slate-900">{resource.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
