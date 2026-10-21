import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { AdminCreditInterestPackResponse, AdminCreditInterestResponse, AdminCreditInterestUserResponse, CREDIT_PACKS } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/admin/credits/interest — everyone who clicked "Buy" while
// buying was switched off, per user and per pack. Admin only.
async function getHandler(_req: NextRequest, _userContext: KoalaGainsJwtTokenPayload): Promise<AdminCreditInterestResponse> {
  const clicks = await prisma.creditPurchaseInterest.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { userId: true, packKey: true, credits: true, amountInCents: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const userIds = Array.from(new Set(clicks.map((click) => click.userId)));
  const [users, buyers] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true, username: true } }),
    prisma.user.findMany({ where: { id: { in: userIds }, firstPurchaseAt: { not: null } }, select: { id: true } }),
  ]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const buyerIds = new Set(buyers.map((user) => user.id));

  const byUser = new Map<string, { clicks: number; lastPackCredits: number; maxPackCredits: number; maxPackCents: number; first: Date; last: Date }>();
  const byPack = new Map<string, { clicks: number; users: Set<string> }>();

  // Clicks are oldest-first, so the last one seen per user is their latest.
  for (const click of clicks) {
    const row = byUser.get(click.userId);
    if (!row) {
      byUser.set(click.userId, {
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
      if (click.credits > row.maxPackCredits) {
        row.maxPackCredits = click.credits;
        row.maxPackCents = click.amountInCents;
      }
    }

    const pack = byPack.get(click.packKey) ?? { clicks: 0, users: new Set<string>() };
    pack.clicks += 1;
    pack.users.add(click.userId);
    byPack.set(click.packKey, pack);
  }

  const userRows: AdminCreditInterestUserResponse[] = Array.from(byUser.entries())
    .filter(([userId]) => usersById.has(userId))
    .map(([userId, row]) => {
      const user = usersById.get(userId)!;
      return {
        userId,
        name: user.name,
        email: user.email,
        username: user.username,
        clicks: row.clicks,
        lastPackCredits: row.lastPackCredits,
        maxPackCredits: row.maxPackCredits,
        firstClickAt: row.first.toISOString(),
        lastClickAt: row.last.toISOString(),
        hasPurchased: buyerIds.has(userId),
      };
    })
    .sort((a, b) => b.lastClickAt.localeCompare(a.lastClickAt));

  const packRows: AdminCreditInterestPackResponse[] = CREDIT_PACKS.map((pack) => ({
    packKey: pack.key,
    credits: pack.credits,
    clicks: byPack.get(pack.key)?.clicks ?? 0,
    users: byPack.get(pack.key)?.users.size ?? 0,
  }));

  return {
    totalClicks: clicks.length,
    uniqueUsers: byUser.size,
    potentialRevenueInCents: Array.from(byUser.values()).reduce((sum, row) => sum + row.maxPackCents, 0),
    packs: packRows,
    users: userRows,
  };
}

export const GET = withLoggedInAdmin<AdminCreditInterestResponse>(getHandler);
