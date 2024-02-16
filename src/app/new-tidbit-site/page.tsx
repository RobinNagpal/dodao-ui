'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/core/page/PageWrapper';
import Button from '@/components/core/buttons/Button';
import LoginInformation from './component/LoginInformation';
import NewSiteInformation from './component/NewSiteInformation';
import HorizontalStepperSimple from '@/components/core/stepper/HorizontalStepperSimple';

type Step = {
  id: string;
  name: string;
  status: 'complete' | 'current' | 'upcoming';
};

const initialSteps: Step[] = [
  { id: 'Step 1', name: 'Login Details', status: 'current' },
  { id: 'Step 2', name: 'Tidbit Site Details', status: 'upcoming' },
  { id: 'Step 3', name: 'Final Configuration', status: 'upcoming' },
];

export default function NewTidbitSite() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStepId, setCurrentStepId] = useState('Step 1');

  const goToNextStep = () => {
    const nextStepIndex = steps.findIndex((step) => step.id === currentStepId) + 1;
    if (nextStepIndex < steps.length) {
      const newSteps: Step[] = steps.map((step, index) => {
        if (index === nextStepIndex - 1) {
          return { ...step, status: 'complete' };
        } else if (index === nextStepIndex) {
          return { ...step, status: 'current' };
        }
        return step;
      });

      setSteps(newSteps);
      setCurrentStepId(steps[nextStepIndex].id);
    }
  };

  const goToPreviousStep = () => {
    const prevStepIndex = steps.findIndex((step) => step.id === currentStepId) - 1;
    if (prevStepIndex >= 0) {
      const newSteps: Step[] = steps.map((step, index) => {
        if (index === prevStepIndex) {
          return { ...step, status: 'current' };
        } else if (index === prevStepIndex + 1) {
          return { ...step, status: 'upcoming' };
        }
        return step;
      });

      setSteps(newSteps);
      setCurrentStepId(steps[prevStepIndex].id);
    }
  };

  const getStepContent = (stepId: string) => {
    switch (stepId) {
      case 'Step 1':
        return <LoginInformation onSuccessfulSave={goToNextStep} />;
      case 'Step 2':
        return <NewSiteInformation />;
      default:
        return null;
    }
  };
  return (
    <PageWrapper>
      <HorizontalStepperSimple steps={steps} />
      {getStepContent(currentStepId)}
      {currentStepId !== 'Step 1' && (
        <Button onClick={goToPreviousStep} variant="outlined" className="mt-4">
          Previous
        </Button>
      )}
    </PageWrapper>
  );
}
