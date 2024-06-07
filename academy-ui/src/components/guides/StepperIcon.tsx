import { GuideStepFragment } from '@/graphql/generated/generated-types';
import { isQuestion, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import React from 'react';

// Define your types and helper functions
// import { GuideStep } from 'your-path-to/GuideModel';
// import { isQuestion, isUserInput } from 'your-path-to/helpers/stepItemTypes';

interface SvgComponentProps {
  width: string;
  height: string;
  children: React.ReactNode;
}

const SvgComponent: React.FC<SvgComponentProps> = ({ width, height, children }) => (
  <svg style={{ width, height }} viewBox="0 0 24 24">
    {children}
  </svg>
);

interface StepIconProps {
  step: GuideStepFragment;
}

const StepperIcon: React.FC<StepIconProps> = ({ step }) => {
  const hasQuestions = step.stepItems.some((item) => isQuestion(item));
  const hasInputs = step.stepItems.some((item) => isUserInput(item));

  if (hasQuestions) {
    return (
      <SvgComponent width="24px" height="24px">
        <path
          fill="currentColor"
          d="M4,2A2,2 0 0,0 2,4V16A2,2 0 0,0 4,18H8V21A1,1 0 0,0 9,22H9.5V22C9.75,22 10,21.9 10.2,21.71L13.9,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2H4M4,4H20V16H13.08L10,19.08V16H4V4M12.19,5.5C11.3,5.5 10.59,5.68 10.05,6.04C9.5,6.4 9.22,7 9.27,7.69C0.21,7.69 6.57,7.69 11.24,7.69C11.24,7.41 11.34,7.2 11.5,7.06C11.7,6.92 11.92,6.85 12.19,6.85C12.5,6.85 12.77,6.93 12.95,7.11C13.13,7.28 13.22,7.5 13.22,7.8C13.22,8.08 13.14,8.33 13,8.54C12.83,8.76 12.62,8.94 12.36,9.08C11.84,9.4 11.5,9.68 11.29,9.92C11.1,10.16 11,10.5 11,11H13C13,10.72 13.05,10.5 13.14,10.32C13.23,10.15 13.4,10 13.66,9.85C14.12,9.64 14.5,9.36 14.79,9C15.08,8.63 15.23,8.24 15.23,7.8C15.23,7.1 14.96,6.54 14.42,6.12C13.88,5.71 13.13,5.5 12.19,5.5M11,12V14H13V12H11Z"
        />
      </SvgComponent>
    );
  }
  if (hasInputs) {
    return (
      <SvgComponent width="24px" height="24px">
        <path
          fill="currentColor"
          d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7M20,15V9H17V15H20Z"
        />
      </SvgComponent>
    );
  }

  return (
    <SvgComponent width="24px" height="24px">
      <path
        fill="currentColor"
        d="M14,10H19.5L14,4.5V10M5,3H15L21,9V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3M5,12V14H19V12H5M5,16V18H14V16H5Z"
      />
    </SvgComponent>
  );
};

export default StepperIcon;
