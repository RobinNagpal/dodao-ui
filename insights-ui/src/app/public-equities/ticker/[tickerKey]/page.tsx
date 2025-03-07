'use client';

import TickerDetailsPageWrapper from './TicketDetailsPage';

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  return <TickerDetailsPageWrapper tickerKey={tickerKey} />;
}
