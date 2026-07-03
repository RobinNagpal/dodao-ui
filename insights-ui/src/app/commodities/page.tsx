import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import ReportSection from '@/components/ui/sections/ReportSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { prisma } from '@/prisma';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Commodities — Analysis | KoalaGains',
  description: 'Plain-English analysis of commodities: supply & demand, price & value, volatility & risk, and future outlook.',
  alternates: { canonical: '/commodities' },
};

export default async function CommoditiesIndexPage(): Promise<JSX.Element> {
  const commodities = await prisma.commodity.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    orderBy: [{ commodityGroup: 'asc' }, { name: 'asc' }],
    include: { cachedScore: { select: { finalScore: true } } },
  });

  const groups = Array.from(new Set(commodities.map((c) => c.commodityGroup)));

  return (
    <PageWrapper>
      <ReportSection>
        <Heading as="h1" size="2xl" weight="bold">
          Commodities
        </Heading>
        <Text tone="muted" size="sm">
          Supply &amp; demand, price &amp; value, volatility &amp; risk, and future outlook — analyzed for each commodity.
        </Text>
      </ReportSection>

      {commodities.length === 0 ? (
        <Text tone="muted">No commodities are available yet.</Text>
      ) : (
        groups.map((group) => (
          <ReportSection key={group}>
            <SectionHeading>{group}</SectionHeading>
            <Stack as="ul" gap="sm" mt="sm">
              {commodities
                .filter((c) => c.commodityGroup === group)
                .map((c) => (
                  <InlineCard as="li" key={c.id} padding="factor">
                    <Stack direction="row" align="center" justify="between">
                      <Link href={`/commodities/${c.slug}`} className="link-color hover:underline">
                        {c.name}
                      </Link>
                      {c.cachedScore && (
                        <Text size="sm" tone="muted">
                          Score {c.cachedScore.finalScore}
                        </Text>
                      )}
                    </Stack>
                  </InlineCard>
                ))}
            </Stack>
          </ReportSection>
        ))
      )}
    </PageWrapper>
  );
}
