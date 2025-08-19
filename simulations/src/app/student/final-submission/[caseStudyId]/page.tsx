import FinalSubmissionClient from './FinalSubmissionClient';

interface FinalSubmissionPageProps {
  params: Promise<{
    caseStudyId: string;
  }>;
}

export default async function FinalSubmissionPage({ params }: FinalSubmissionPageProps) {
  const { caseStudyId } = await params;

  return <FinalSubmissionClient caseStudyId={caseStudyId} />;
}
