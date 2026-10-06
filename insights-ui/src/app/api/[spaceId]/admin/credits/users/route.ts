import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { AdminCreditUserResponse, AdminCreditUsersResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { getUserCredits } from '@/utils/credits/credit-service';
import { ReportSpendStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

/** Balances read at once: each is ~4 DB queries plus a Stripe call. */
const BALANCE_CONCURRENCY = 5;

/** `fn` over every item, at most `concurrency` at a time, results in input order. */
async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

/** One buyer's balance, or null when it can't be read — one bad account must not fail the whole list. */
async function balanceOrNull(userId: string): Promise<number | null> {
  try {
    const { credits, stripeUnavailable } = await getUserCredits(userId);
    if (stripeUnavailable) {
      // getUserCredits already logged the Stripe error; its 0 is a placeholder, not the balance.
      console.error(`Admin credits: the Stripe balance of user ${userId} is unavailable`);
      return null;
    }
    return credits;
  } catch (error) {
    console.error(`Admin credits: could not load the balance of user ${userId}`, error);
    return null;
  }
}

// GET /api/[spaceId]/admin/credits/users — every user who has bought credits,
// with what they spent and how many reports they generated. Admin only.
async function getHandler(req: NextRequest, userContext: KoalaGainsJwtTokenPayload): Promise<AdminCreditUsersResponse> {
  const purchasesByUser = await prisma.stripeCreditPurchase.groupBy({
    by: ['userId'],
    where: { spaceId: KoalaGainsSpaceId },
    _sum: { credits: true, amountInCents: true },
    _count: { _all: true },
    _max: { createdAt: true },
  });

  if (purchasesByUser.length === 0) {
    return { users: [] };
  }

  const userIds = purchasesByUser.map((row) => row.userId);

  // Report spends are counted separately: a purchaser who never generated a
  // report has no spend rows at all, so this can't be folded into one groupBy.
  // Only paid runs count: Completed AND actually charged in Stripe. Reserved
  // (InProgress) and Failed runs took no credit, and a Completed run whose
  // charge failed twice was kept free of charge (no stripeDebitTxnId).
  // Balances come from Stripe (cached), one per buyer, a few at a time.
  const [users, spendsByUser, balances] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds }, spaceId: KoalaGainsSpaceId },
      select: { id: true, name: true, email: true, username: true },
    }),
    prisma.reportSpend.groupBy({
      by: ['userId'],
      where: { spaceId: KoalaGainsSpaceId, status: ReportSpendStatus.Completed, stripeDebitTxnId: { not: null }, userId: { in: userIds } },
      _count: { _all: true },
    }),
    mapWithConcurrency(userIds, BALANCE_CONCURRENCY, async (userId) => [userId, await balanceOrNull(userId)] as const),
  ]);

  const usersById = new Map(users.map((user) => [user.id, user]));
  const reportsByUserId = new Map(spendsByUser.map((row) => [row.userId, row._count._all]));
  const creditsByUserId = new Map(balances);

  const rows: AdminCreditUserResponse[] = purchasesByUser
    // A purchase row always has a user, but a deleted one would otherwise crash the page.
    .filter((row) => usersById.has(row.userId))
    .map((row) => {
      const user = usersById.get(row.userId)!;
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        credits: creditsByUserId.get(user.id) ?? null,
        purchasedCredits: row._sum.credits ?? 0,
        amountSpentInCents: row._sum.amountInCents ?? 0,
        purchaseCount: row._count._all,
        lastPurchaseAt: (row._max.createdAt ?? new Date(0)).toISOString(),
        reportsGenerated: reportsByUserId.get(row.userId) ?? 0,
      };
    })
    // Most recent buyer first: new purchases are what an admin looks for.
    .sort((a, b) => b.lastPurchaseAt.localeCompare(a.lastPurchaseAt));

  return { users: rows };
}

export const GET = withLoggedInAdmin<AdminCreditUsersResponse>(getHandler);
