interface Step {
  id: string;
  name: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface StepperItemProps {
  step: Step;
}

const StepperItem: React.FC<StepperItemProps> = ({ step }) => {
  return (
    <li className="md:flex-1">
      <span
        className={`group flex flex-col ${
          step.status === 'complete'
            ? 'border-indigo-600 hover:border-indigo-800'
            : step.status === 'current'
            ? 'border-indigo-600'
            : 'border-gray-200 hover:border-gray-300'
        } border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4`}
        aria-current={step.status === 'current' ? 'step' : undefined}
      >
        <span
          className={`text-sm font-medium ${
            step.status === 'complete'
              ? 'text-indigo-600 group-hover:text-indigo-800'
              : step.status === 'current'
              ? 'text-indigo-600'
              : 'text-gray-500 group-hover:text-gray-700'
          }`}
        >
          {step.id}
        </span>
        <span className="text-sm font-medium">{step.name}</span>
      </span>
    </li>
  );
};

export default StepperItem;
