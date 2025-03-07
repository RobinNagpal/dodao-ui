import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TickerDetailsPageWrapper from './TicketDetailsPage';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/ticker/${tickerKey}}`,
      current: true,
    },
  ];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <TickerDetailsPageWrapper tickerKey={tickerKey} />
    </PageWrapper>
  );
}
