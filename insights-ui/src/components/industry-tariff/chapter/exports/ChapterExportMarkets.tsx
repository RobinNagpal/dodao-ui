import ExportRateMatrix from '@/components/industry-tariff/chapter/exports/ExportRateMatrix';
import { EXPORT_STATUS_BADGE, change, usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import SourcesCard, { documentSourceItems } from '@/components/industry-tariff/chapter/updates/SourcesCard';
import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffExportMarket, TariffExportMarketsContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Export markets: what each destination charges on U.S. goods and what it takes to sell there. A
// customs union (the EU) is one market, since its members share one tariff and one drug regulator.
// The market × product-group matrix is the one boxed section; below it, one profile per market
// (trade agreement, tariff, main products, the regulator whose approval decides access, and the
// trade.gov country guide), one full-width card per market, then how the rates were worked out.

function MarketProfile({ market, tradeYear }: { market: TariffExportMarket; tradeYear: number }): React.JSX.Element {
  const badge = EXPORT_STATUS_BADGE[market.status];
  const { profile } = market;
  return (
    <InlineCard surface="card" padding="spacious">
      <Stack gap="sm">
        <Stack direction="row" gap="sm" align="center" justify="between" wrap>
          <Heading as="h3" size="lg" tone="white">
            {market.name}
          </Heading>
          <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
        </Stack>
        <Text size="xs" tone="muted">
          {usd(market.exportsUsd)} in {tradeYear} ({change(market.changePct) ?? 'n/a'}) · {market.sharePct.toFixed(1)}% of U.S. exports
        </Text>
        <Text size="sm">{profile.headline}</Text>
        <DefinitionList
          look="fields"
          columns="1"
          items={[
            { term: 'Tariff on U.S. goods', definition: profile.tariffNow },
            { term: 'Trade agreement with the U.S.', definition: market.usTradeAgreement ?? 'None' },
            { term: 'Buys mostly', definition: profile.mainProducts },
            ...(market.members && market.members.length > 0
              ? [{ term: 'Largest members', definition: market.members.map((m) => `${m.country} ${usd(m.exportsUsd)}`).join(' · ') }]
              : []),
            {
              term: 'To sell there',
              definition: (
                <>
                  {profile.regulator.requirement}{' '}
                  <TextLink href={profile.regulator.url} size="sm" wrap>
                    {profile.regulator.name} ↗
                  </TextLink>
                </>
              ),
            },
          ]}
        />
        <TextLink href={profile.countryGuide.url} size="xs" wrap>
          {profile.countryGuide.label} ↗
        </TextLink>
      </Stack>
    </InlineCard>
  );
}

export default function ChapterExportMarkets({ markets }: { markets: TariffExportMarketsContent }): React.JSX.Element {
  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Trade values {markets.tradeYear} · tariff schedules {markets.tariffYear}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(markets.intro)} />
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Tariff on U.S. goods by market and product group
            </SectionHeading>
            <Text size="sm" tone="muted">
              Each cell: the market&apos;s tariff on U.S.-origin goods, then {markets.tradeYear} U.S. exports. Select a cell to see where the rate comes from
              and the normal rate other countries pay.
            </Text>
          </Stack>
          <ExportRateMatrix markets={markets} />
          <Text size="xs" tone="muted">
            {markets.coverageNote}
          </Text>
        </Stack>
      </CardSection>

      <Stack as="section" gap="lg">
        <Stack gap="xs">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Market by market
          </SectionHeading>
          <Text size="sm" tone="muted">
            What each market buys, what it charges, whether the U.S. has a trade agreement with it, and whose approval is needed to sell there.
          </Text>
        </Stack>
        <Stack gap="lg">
          {markets.markets.map((m) => (
            <MarketProfile key={m.countryCode} market={m} tradeYear={markets.tradeYear} />
          ))}
        </Stack>
      </Stack>

      <Stack as="section" gap="md">
        <SectionHeading as="h2" size="md" weight="bold" tone="heading">
          How these rates are worked out
        </SectionHeading>
        <Stack as="ul" gap="sm">
          {markets.assumptions.map((note) => (
            <li key={note}>
              <Text size="sm" tone="muted">
                {note}
              </Text>
            </li>
          ))}
        </Stack>
      </Stack>

      <SourcesCard items={documentSourceItems(markets.sources)} />
    </Stack>
  );
}
