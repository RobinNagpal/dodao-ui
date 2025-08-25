import { Suspense } from 'react';
import FinalSummaryClient from './FinalSummaryClient';

interface PageProps {
  params: Promise<{ caseStudyId: string }>;
}

export default async function FinalSummaryPage({ params }: PageProps) {
  const { caseStudyId } = await params;

  return <FinalSummaryClient caseStudyId={caseStudyId} />;
}
