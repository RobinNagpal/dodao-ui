import TidbitsSiteSetup from '@/app/new-tidbit-site/[stepId]/TidbitsSiteSetup';
import React from 'react';
import { StepId } from './steps';

export default function NewTidbitSite() {
  return <TidbitsSiteSetup stepId={'user-details'} />;
}
