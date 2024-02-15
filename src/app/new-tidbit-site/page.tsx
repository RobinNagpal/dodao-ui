import PageWrapper from '@/components/core/page/PageWrapper';
import StepperItem from '@/utils/stepper/Stepper';

type Step = {
  id: string;
  name: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
};

const steps: Step[] = [
  { id: 'Step 1', name: 'Job details', href: '#', status: 'complete' },
  { id: 'Step 2', name: 'Application form', href: '#', status: 'current' },
  { id: 'Step 3', name: 'Preview', href: '#', status: 'upcoming' },
];

export default function MyFunction() {
  return (
    <PageWrapper>
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step) => (
            <StepperItem key={step.id} step={step} />
          ))}
        </ol>
      </nav>
    </PageWrapper>
  );
}
