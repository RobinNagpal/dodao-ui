import CriterionDetails from './CriterionDetailsPage';

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  return <CriterionDetails tickerKey={tickerKey} criterionKey={criterionKey} />;
}
