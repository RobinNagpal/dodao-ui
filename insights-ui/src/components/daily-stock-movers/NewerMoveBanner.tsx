import { DailyMoverHistoryItem } from '@/types/daily-stock-movers';
import { formatMoverDate } from '@/utils/metadata-generators';
import { getMoveChangeText, getMoveDetailsPath } from '@/components/daily-stock-movers/ticker-move-utils';
import Stack from '@/components/ui/containers/Stack';
import NoticeCallout from '@/components/ui/NoticeCallout';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';

interface NewerMoveBannerProps {
  /** Other moves for this ticker, newest first. */
  moves: DailyMoverHistoryItem[];
  /** When the current page's move was recorded. */
  currentCreatedAt: Date | string;
}

/** Top-of-page notice on an older mover page pointing to the stock's latest move. Nothing renders when this is the latest. */
export default function NewerMoveBanner({ moves, currentCreatedAt }: NewerMoveBannerProps) {
  const latest = moves[0];
  if (!latest || latest.createdAt <= new Date(currentCreatedAt).toISOString()) {
    return null;
  }

  return (
    <Stack mb="md">
      <NoticeCallout tone="info">
        <Stack direction="row" wrap gap="sm" align="baseline">
          <Text as="span" size="inherit" tone="inherit">
            Newer move: {latest.symbol} {getMoveChangeText(latest)} on {formatMoverDate(latest.createdAt)}.
          </Text>
          <TextLink href={getMoveDetailsPath(latest)}>Read the latest analysis →</TextLink>
        </Stack>
      </NoticeCallout>
    </Stack>
  );
}
