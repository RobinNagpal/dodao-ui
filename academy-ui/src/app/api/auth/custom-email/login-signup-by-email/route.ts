import { createHash } from '@dodao/web-core/api/auth/createHash';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { User } from 'next-auth/core/types';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { defaultNormalizer, randomString, sendVerificationRequest } from '@dodao/web-core/api/auth/custom-email/send-verification';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import { LoginSignupByEmailRequestBody } from '@/types/request/LoginSignupByEmailRequest';

const createUser = async (user: User & { email: string }, spaceId: string) => {
  console.log('######### signIn - Creating new user #########');
  const upsertedUser = await prisma.user.upsert({
    create: {
      spaceId,
      email: user.email,
      emailVerified: new Date(),
      authProvider: 'email',
      username: user.email,
    },
    update: {
      emailVerified: new Date(),
    },
    where: {
      email_spaceId: {
        email: user.email,
        spaceId,
      },
    },
  });

  await prisma.account.upsert({
    create: {
      type: 'credentials',
      provider: 'custom-email',
      providerAccountId: user.email,
      userId: upsertedUser.id,
    },
    update: {},
    where: {
      provider_providerAccountId: {
        provider: 'custom-email',
        providerAccountId: user.email,
      },
    },
  });
};
/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter).
 * At the end, it returns a redirect to the `verify-request` page.
 */
async function postHandler(req: NextRequest) {
  const reqBody = (await req.json()) as LoginSignupByEmailRequestBody;
  const { spaceId, email, context } = reqBody;

  console.log('######### send-verification - POST #########');
  console.log('request', JSON.stringify(reqBody));

  console.log('request', JSON.stringify(req.cookies.getAll()));

  const userEmail = defaultNormalizer(email);

  const defaultUser = { id: crypto.randomUUID(), email: userEmail, emailVerified: null };

  // We do this because we want to allow to login on TidbitsHub only using the email. If a user create a space
  // and then comes back to login via Tidbits hub, this flow will be invoked.
  const user =
    spaceId === PredefinedSpaces.TIDBITS_HUB
      ? await prisma.user.findFirst({ where: { email: userEmail } })
      : await prisma.user.findUnique({ where: { email_spaceId: { email: userEmail, spaceId } } });

  console.log('user', user);
  if (!user) {
    await createUser(defaultUser, spaceId);
  }

  const token = randomString(32);

  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000 * 30); // 30 days

  const headersList = await headers();

  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const httpsProto = headersList.get('x-forwarded-proto');
  // Do whatever you want here, before the request is passed down to `NextAuth`

  const baseUrl = `${httpsProto}://${host}`;

  const url = `${baseUrl}/auth/email/verify?${new URLSearchParams({
    token,
  })}&context=${context}`;
  console.log('url', url);
  await sendVerificationRequest({
    identifier: userEmail,
    token,
    expires,
    url: url,
  });

  const data = {
    identifier: userEmail,
    token: await createHash(`${token}${process.env.EMAIL_TOKEN_SECRET!}`),
    expires,
  };
  await prisma.verificationToken.create({ data });

  return NextResponse.json({});
}

export const POST = withErrorHandling(postHandler);
