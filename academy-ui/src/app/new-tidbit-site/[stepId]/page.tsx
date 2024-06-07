import TidbitsSiteSetup from '@/app/new-tidbit-site/[stepId]/TidbitsSiteSetup';
import { StepId } from '@/app/new-tidbit-site/steps';

export default function TidbitsSiteSetupStep({ params: { stepId } }: { params: { stepId: string } }) {
  return <TidbitsSiteSetup stepId={stepId as StepId} />;
}
