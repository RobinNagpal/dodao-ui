import { MutationDeleteByteArgs } from '@/graphql/generated/generated-types';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDeleteByteArgs = await req.json();
  validateSuperAdmin(req);

  const deleted = await prisma.byte.delete({
    where: {
      id: args.byteId,
    },
  });

  return NextResponse.json({ status: 200, deleted: !!deleted });
}
