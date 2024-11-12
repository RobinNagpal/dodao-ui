import TidbitsSiteSetup from '@/app/new-tidbit-site/[stepId]/TidbitsSiteSetup';
import { StepId } from '@/app/new-tidbit-site/steps';

export default async function TidbitsSiteSetupStep({ params }: { params: Promise<{ stepId: string }> }) {
  const stepId = (await params).stepId;
  return <TidbitsSiteSetup stepId={stepId as StepId} />;
}
