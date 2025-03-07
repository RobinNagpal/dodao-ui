'use client';

import CriterionDetails from './CriterionDetailsPage';

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Criterion Details</h1>
      <CriterionDetails tickerKey={tickerKey} criterionKey={criterionKey} />
    </div>
  );
}
