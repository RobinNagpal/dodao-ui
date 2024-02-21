'use client';

import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import HorizontalStepperSimple from '@/components/core/stepper/HorizontalStepperSimple';
import NewTidbitsSiteInformationStep from '@/components/tidbitsSite/setupSteps/NewTidbitsSiteInformationStep';
import TidbitSiteConfigurationStep from '@/components/tidbitsSite/setupSteps/TidbitSiteConfigurationStep';
import UserInformationStep from '@/components/tidbitsSite/setupSteps/UserInformationStep';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { initialSteps, Step, StepId } from './../steps';

export default function TidbitsSiteSetup({ stepId }: { stepId: StepId }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const router = useRouter();
  const goToNextStep = () => {
    const nextStepIndex = steps.findIndex((step) => step.id === stepId) + 1;
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
      router.push(`/new-tidbit-site/${steps[nextStepIndex].id}`);
    }
  };

  const goToPreviousStep = () => {
    const prevStepIndex = steps.findIndex((step) => step.id === stepId) - 1;
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
      router.push(`/new-tidbit-site/${steps[prevStepIndex].id}`);
    }
  };

  const getStepContent = (stepId: StepId) => {
    switch (stepId) {
      case 'user-details':
        return <UserInformationStep onSuccessfulSave={goToNextStep} />;
      case 'tidbit-site-details':
        return <NewTidbitsSiteInformationStep onSuccessfulSave={goToNextStep} />;
      case 'site-configuration':
        return <TidbitSiteConfigurationStep />;
      default:
        return null;
    }
  };
  return (
    <PageWrapper>
      <HorizontalStepperSimple steps={steps} currentStepId={stepId} />
      {getStepContent(stepId)}
      {stepId !== 'user-details' ||
        ('Step 3' && (
          <Button onClick={goToPreviousStep} variant="outlined" className="mt-4">
            Previous
          </Button>
        ))}
    </PageWrapper>
  );
}
