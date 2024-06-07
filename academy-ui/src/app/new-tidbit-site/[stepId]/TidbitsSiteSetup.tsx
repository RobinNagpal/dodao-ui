'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import HorizontalStepperSimple from '@/components/core/stepper/HorizontalStepperSimple';
import NewTidbitsSiteInformationStep from '@/components/tidbitsSite/setupSteps/NewTidbitsSiteInformationStep';
import TidbitSiteConfigurationStep from '@/components/tidbitsSite/setupSteps/TidbitSiteConfigurationStep';
import UserInformationStep from '@/components/tidbitsSite/setupSteps/UserInformationStep';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { initialSteps, Step, StepId } from './../steps';

export default function TidbitsSiteSetup({ stepId }: { stepId: StepId }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const router = useRouter();
  const { data: session } = useSession();
  const superAdmin = !!(session && isSuperAdmin(session as Session));

  const goToNextStep = () => {
    const nextStepIndex = steps.findIndex((step) => step.id === stepId) + 1;
    if (nextStepIndex < steps.length) {
      const newSteps: Step[] = steps.map((step, index) => {
        if (index === nextStepIndex - 1) {
          return { ...step, status: 'complete' };
        } else if (index === nextStepIndex) {
          return { ...step, status: 'upcoming' };
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
        return <UserInformationStep goToNextStep={goToNextStep} />;
      case 'tidbit-site-details':
        return <NewTidbitsSiteInformationStep goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} />;
      case 'site-configuration':
        return <TidbitSiteConfigurationStep goToPreviousStep={goToPreviousStep} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (stepId === 'user-details' && superAdmin) {
      router.push('/new-tidbit-site/tidbit-site-details');
    }
  }, []);
  return (
    <PageWrapper>
      <HorizontalStepperSimple steps={steps} currentStepId={stepId} />
      {getStepContent(stepId)}
    </PageWrapper>
  );
}
