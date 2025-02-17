import { createHash } from '@dodao/web-core/api/auth/createHash';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { defaultNormalizer, randomString } from '@dodao/web-core/api/auth/custom-email/send-verification';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

async function postHandler(req: NextRequest): Promise<NextResponse<{ token: string }>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) throw new Error('User not present in session');

  const userEmail = defaultNormalizer(session.username);

  const token = randomString(32);
  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000 * 30); // 30 days

  const data = {
    identifier: userEmail,
    token: await createHash(`${token}${process.env.EMAIL_TOKEN_SECRET!}`),
    expires,
  };
  await prisma.verificationToken.create({ data });

  return NextResponse.json({ token });
}

export const POST = withErrorHandlingV1<{ token: string }>(postHandler);
