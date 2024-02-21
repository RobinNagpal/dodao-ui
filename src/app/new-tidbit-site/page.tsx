import TidbitsSiteSetup from '@/app/new-tidbit-site/[stepId]/TidbitsSiteSetup';
import React from 'react';
import { StepId } from './steps';

export default function NewTidbitSite() {
  console.log(`Load NewTidbitSite`);
  return <TidbitsSiteSetup stepId={StepId.UserDetails} />;
}
