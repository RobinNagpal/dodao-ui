import MoverShareCard from '@/components/daily-stock-movers/MoverShareCard';
import { prisma } from '@/prisma';
import { DailyMoverType } from '@/types/daily-mover-constants';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatMoverDate, getMoverHeadline, MOVER_CARD_SIZE, shortCompanyName } from '@/utils/metadata-generators';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

/**
 * Share card (og:image / twitter:image / NewsArticle image) for a daily mover page:
 * `/og/daily-movers/v1/{gainer|loser}/{moverId}`.
 *
 * Nothing is pre-generated or stored: a card is drawn the first time a crawler or link-preview bot
 * (Google, WhatsApp, Discord, X, …) requests it — normal page views never load it — and the CDN then
 * serves it from cache. A mover's numbers never change after the day of the move, so the cache is
 * 5 years; a new card design gets a new path version (`v2`) instead of a cache purge.
 * Lives outside `/api` because robots.txt disallows `/api` and Google must be able to fetch it.
 */

const CARD_CACHE_SECONDS = 5 * 365 * 24 * 60 * 60;

const CARD_CACHE_CONTROL = `public, max-age=${CARD_CACHE_SECONDS}, s-maxage=${CARD_CACHE_SECONDS}, immutable, no-transform`;

const MOVER_CARD_FIELDS = { name: true, symbol: true, title: true, percentageChange: true, createdAt: true } as const;

function findMover(type: DailyMoverType, moverId: string) {
  const query = { where: { id: moverId, spaceId: KoalaGainsSpaceId }, select: MOVER_CARD_FIELDS };
  return type === DailyMoverType.GAINER ? prisma.dailyTopGainer.findFirst(query) : prisma.dailyTopLoser.findFirst(query);
}

// Never cached, so a card requested before its mover exists isn't stuck as a 404.
function notFound(): Response {
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ type: string; moverId: string }> }): Promise<Response> {
  const { type, moverId } = await context.params;
  if (type !== DailyMoverType.GAINER && type !== DailyMoverType.LOSER) {
    return notFound();
  }

  const mover = await findMover(type, moverId);
  if (!mover) {
    return notFound();
  }

  return new ImageResponse(
    (
      <MoverShareCard
        type={type}
        companyName={shortCompanyName(mover.name)}
        symbol={mover.symbol}
        percentageChange={mover.percentageChange}
        date={formatMoverDate(mover.createdAt)}
        headline={mover.title || getMoverHeadline(mover, type)}
      />
    ),
    { ...MOVER_CARD_SIZE, headers: { 'Cache-Control': CARD_CACHE_CONTROL } }
  );
}
