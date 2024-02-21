import { initialSteps } from '@/app/new-tidbit-site/steps';

export type StepStatus = 'complete' | 'current' | 'upcoming';

interface Step {
  id: string;
  name: string;
  status: StepStatus;
}

interface StepperItemProps {
  currentStepId: string;
  steps: Step[];
}
const getStepStatus = (stepId: string, currentStepId: string): StepStatus => {
  const currentStepIndex = initialSteps.findIndex((step) => step.id === currentStepId);
  const stepIndex = initialSteps.findIndex((step) => step.id === stepId);

  console.log('currentStepIndex', currentStepIndex);
  console.log('stepIndex', stepIndex);

  if (stepIndex < currentStepIndex) {
    return 'complete';
  } else if (stepIndex === currentStepIndex) {
    return 'current';
  } else {
    return 'upcoming';
  }
};

const HorizontalStepperSimple: React.FC<StepperItemProps> = ({ currentStepId, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => {
          const index = steps.findIndex((s) => step.id === s.id) + 1;
          const status = getStepStatus(steps[0].id, currentStepId);

          console.log('stepId', step.id);
          console.log('currentStepId', currentStepId);
          console.log('status', status);
          return (
            <li key={step.id} className="md:flex-1">
              {status === 'complete' ? (
                <div className="group flex flex-col border-l-4 border-indigo-600 py-2 pl-4 hover:border-indigo-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800">{`Step ${index}`}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : status === 'current' ? (
                <div className="flex flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                  <span className="text-sm font-medium text-indigo-600">{`Step ${index}`}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">{`Step ${index}`}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default HorizontalStepperSimple;
