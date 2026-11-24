import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { AdminCreditInterestPackResponse, AdminCreditInterestResponse, AdminCreditInterestUserResponse, CREDIT_PACKS } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

interface VisitorRow {
  userId: string | null;
  anonymousId: string | null;
  country: string | null;
  clicks: number;
  lastPackCredits: number;
  maxPackCredits: number;
  maxPackCents: number;
  first: Date;
  last: Date;
}

// GET /api/[spaceId]/admin/credits/interest — everyone who clicked "Buy" while
// buying was switched off, per user (or logged-out visitor) and per pack. Admin only.
async function getHandler(_req: NextRequest, _userContext: KoalaGainsJwtTokenPayload): Promise<AdminCreditInterestResponse> {
  const clicks = await prisma.creditPurchaseInterest.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { userId: true, anonymousId: true, country: true, packKey: true, credits: true, amountInCents: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const userIds = Array.from(new Set(clicks.flatMap((click) => (click.userId ? [click.userId] : []))));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, username: true, firstPurchaseAt: true },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  // One row per logged-in user, or per browser for logged-out clicks.
  const byVisitor = new Map<string, VisitorRow>();
  const byPack = new Map<string, { clicks: number; visitors: Set<string> }>();

  // Clicks are oldest-first, so the last one seen per visitor is their latest.
  for (const click of clicks) {
    const key = click.userId ? `user:${click.userId}` : `anon:${click.anonymousId}`;
    const row = byVisitor.get(key);
    if (!row) {
      byVisitor.set(key, {
        userId: click.userId,
        anonymousId: click.userId ? null : click.anonymousId,
        country: click.country,
        clicks: 1,
        lastPackCredits: click.credits,
        maxPackCredits: click.credits,
        maxPackCents: click.amountInCents,
        first: click.createdAt,
        last: click.createdAt,
      });
    } else {
      row.clicks += 1;
      row.lastPackCredits = click.credits;
      row.last = click.createdAt;
      row.country = click.country ?? row.country;
      if (click.credits > row.maxPackCredits) {
        row.maxPackCredits = click.credits;
        row.maxPackCents = click.amountInCents;
      }
    }

    const pack = byPack.get(click.packKey) ?? { clicks: 0, visitors: new Set<string>() };
    pack.clicks += 1;
    pack.visitors.add(key);
    byPack.set(click.packKey, pack);
  }

  const visitorRows = Array.from(byVisitor.values()).filter((row) => !row.userId || usersById.has(row.userId));

  const userRows: AdminCreditInterestUserResponse[] = visitorRows
    .map((row) => {
      const user = row.userId ? usersById.get(row.userId) : undefined;
      return {
        userId: row.userId,
        anonymousId: row.anonymousId,
        name: user?.name ?? null,
        email: user?.email ?? null,
        username: user?.username ?? null,
        country: row.country,
        clicks: row.clicks,
        lastPackCredits: row.lastPackCredits,
        maxPackCredits: row.maxPackCredits,
        firstClickAt: row.first.toISOString(),
        lastClickAt: row.last.toISOString(),
        hasPurchased: Boolean(user?.firstPurchaseAt),
      };
    })
    .sort((a, b) => b.lastClickAt.localeCompare(a.lastClickAt));

  const packRows: AdminCreditInterestPackResponse[] = CREDIT_PACKS.map((pack) => ({
    packKey: pack.key,
    credits: pack.credits,
    clicks: byPack.get(pack.key)?.clicks ?? 0,
    users: byPack.get(pack.key)?.visitors.size ?? 0,
  }));

  return {
    totalClicks: clicks.length,
    uniqueUsers: visitorRows.filter((row) => row.userId).length,
    anonymousVisitors: visitorRows.filter((row) => !row.userId).length,
    potentialRevenueInCents: visitorRows.reduce((sum, row) => sum + row.maxPackCents, 0),
    packs: packRows,
    users: userRows,
  };
}

export const GET = withLoggedInAdmin<AdminCreditInterestResponse>(getHandler);
