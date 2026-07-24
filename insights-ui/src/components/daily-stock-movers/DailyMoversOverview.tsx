import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import Stack from '@/components/ui/containers/Stack';
import SplitColumns from '@/components/ui/containers/SplitColumns';
import CardSection from '@/components/ui/sections/CardSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import InlineCard from '@/components/ui/sections/InlineCard';

export interface MoversByDate<T> {
  /** YYYY-MM-DD date the movers were captured on. */
  date: string;
  movers: T[];
}

interface DailyMoversOverviewProps {
  country: string;
  gainersByDate: MoversByDate<TopGainerWithTicker>[];
  losersByDate: MoversByDate<TopLoserWithTicker>[];
}

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatChange(percentageChange: number): string {
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`;
}

function MoversColumn({
  type,
  country,
  groups,
}: {
  type: DailyMoverType;
  country: string;
  groups: MoversByDate<TopGainerWithTicker | TopLoserWithTicker>[];
}): React.JSX.Element {
  const isGainer = type === DailyMoverType.GAINER;
  const slug = isGainer ? 'top-gainers' : 'top-losers';
  const detailsPath = `/daily-top-movers/${slug}/details`;

  return (
    <CardSection>
      <Stack direction="row" justify="between" align="baseline" gap="md" wrap>
        <SectionHeading as="h2">{isGainer ? 'Top Gainers' : 'Top Losers'}</SectionHeading>
        <TextLink href={`/daily-top-movers/${slug}/country/${country}`}>View all →</TextLink>
      </Stack>

      {groups.length === 0 ? (
        <EmptyStateCard variant="inline" title={`No ${isGainer ? 'gainers' : 'losers'} found`} />
      ) : (
        <Stack gap="xl">
          {groups.map((group) => (
            <Stack key={group.date} gap="sm">
              <Text as="div" size="xs" weight="semibold" tone="muted">
                {formatDate(group.date)}
              </Text>
              {group.movers.map((mover) => (
                <InlineCard key={mover.id} href={`${detailsPath}/${mover.id}`}>
                  <Stack direction="row" justify="between" align="center" gap="md">
                    <Stack gap="xxs">
                      <Text as="span" weight="semibold">
                        {mover.ticker.symbol}
                      </Text>
                      <Text as="span" size="xs" tone="muted">
                        {mover.ticker.name}
                      </Text>
                    </Stack>
                    <StatusBadge variant={isGainer ? 'success' : 'danger'} size="sm" label={formatChange(mover.percentageChange)} />
                  </Stack>
                </InlineCard>
              ))}
            </Stack>
          ))}
        </Stack>
      )}
    </CardSection>
  );
}

export default function DailyMoversOverview({ country, gainersByDate, losersByDate }: DailyMoversOverviewProps): React.JSX.Element {
  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Heading as="h1" size="display" weight="bold">
          Top Gainers &amp; Losers in {country.toUpperCase()}
        </Heading>
        <Text tone="muted" size="base">
          The biggest stock gains and declines in {country.toUpperCase()} over the last 5 trading days, side by side. Click any stock for an AI-powered analysis
          of the move.
        </Text>
      </Stack>

      <SplitColumns
        left={<MoversColumn type={DailyMoverType.GAINER} country={country} groups={gainersByDate} />}
        right={<MoversColumn type={DailyMoverType.LOSER} country={country} groups={losersByDate} />}
      />
    </Stack>
  );
}
