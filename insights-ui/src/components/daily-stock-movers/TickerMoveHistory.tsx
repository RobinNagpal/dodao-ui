import { DailyMoverType } from '@/types/daily-mover-constants';
import { DailyMoverHistoryItem } from '@/types/daily-stock-movers';
import { formatMoverDate, getMoverHeadline, shortCompanyName } from '@/utils/metadata-generators';
import { getMoveChangeText, getMoveDetailsPath } from '@/components/daily-stock-movers/ticker-move-utils';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import TimelineRow from '@/components/ui/sections/TimelineRow';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';

interface TickerMoveHistoryProps {
  companyName: string;
  symbol: string;
  /** Other gainer/loser pages for this ticker, newest first. Nothing renders when empty. */
  moves: DailyMoverHistoryItem[];
}

/** "Other big moves" list on a mover details page: every other day this stock was a top gainer or loser. */
export default function TickerMoveHistory({ companyName, symbol, moves }: TickerMoveHistoryProps) {
  if (moves.length === 0) {
    return null;
  }

  return (
    <CardSection mb="lg">
      <SectionHeading bordered>
        {shortCompanyName(companyName)} ({symbol}) stock: other big moves
      </SectionHeading>
      <Stack mb="sm">
        <Text tone="muted">Other days {symbol} was one of the biggest gainers or losers:</Text>
      </Stack>
      <div>
        {moves.map((move) => {
          const changeText = getMoveChangeText(move);
          return (
            <TimelineRow
              key={move.id}
              aside={
                <>
                  <Text as="span" tone="muted">
                    {formatMoverDate(move.createdAt)}
                  </Text>
                  <StatusBadge
                    variant={move.type === DailyMoverType.GAINER ? 'success' : 'danger'}
                    label={changeText.charAt(0).toUpperCase() + changeText.slice(1)}
                    nowrap
                  />
                </>
              }
            >
              <TextLink href={getMoveDetailsPath(move)} size="base" wrap>
                {getMoverHeadline(move, move.type)}
              </TextLink>
            </TimelineRow>
          );
        })}
      </div>
    </CardSection>
  );
}
