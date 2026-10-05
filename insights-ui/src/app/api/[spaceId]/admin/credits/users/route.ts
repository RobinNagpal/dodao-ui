import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { AdminCreditUserResponse, AdminCreditUsersResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CreditTransactionType } from '@prisma/client';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/admin/credits/users — every user who has bought credits,
// with what they spent and how many reports they generated. Admin only.
async function getHandler(req: NextRequest, userContext: KoalaGainsJwtTokenPayload): Promise<AdminCreditUsersResponse> {
  const purchasesByUser = await prisma.creditTransaction.groupBy({
    by: ['userId'],
    where: { spaceId: KoalaGainsSpaceId, type: CreditTransactionType.Purchase },
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
  const [users, spendsByUser] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds }, spaceId: KoalaGainsSpaceId },
      select: { id: true, name: true, email: true, username: true, credits: true },
    }),
    prisma.creditTransaction.groupBy({
      by: ['userId'],
      where: { spaceId: KoalaGainsSpaceId, type: CreditTransactionType.ReportSpend, userId: { in: userIds } },
      _count: { _all: true },
    }),
  ]);

  const usersById = new Map(users.map((user) => [user.id, user]));
  const reportsByUserId = new Map(spendsByUser.map((row) => [row.userId, row._count._all]));

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
        credits: user.credits,
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
