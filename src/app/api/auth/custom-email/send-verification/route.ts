import { createHash } from '@/app/api/auth/custom-email/send-verification/createHash';
import { prisma } from '@/prisma';
import { User } from 'next-auth/core/types';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SES } from '@aws-sdk/client-ses';
const ses = new SES({
  region: process.env.AWS_REGION,
});
/** Web compatible method to create a random string of a given length */
export function randomString(size: number) {
  const i2hex = (i: number) => ('0' + i.toString(16)).slice(-2);
  const r = (a: string, i: number): string => a + i2hex(i);
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).reduce(r, '');
}

const sendVerificationRequest = async (params: { identifier: string; url: string; expires: Date; token: string }) => {
  const { identifier: email, url } = params;

  const link = url;

  // Email HTML body
  const emailBody = `Your sign in link is <a href="${decodeURIComponent(link)}">here</a>.`;

  const from = 'support@tidbitshub.org';
  console.log('Sending email to', email, 'from', from, 'with body', emailBody);
  // Sending email via AWS SES
  ses.sendEmail(
    {
      Source: from,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: 'Sign in to your account',
        },
        Body: {
          Html: {
            Data: emailBody,
          },
        },
      },
    },
    (err, info) => {
      if (err) {
        console.error(err);
        throw new Error('Failed to send email');
      } else {
        console.log('Email sent: ', info);
      }
    }
  );
};

const createUser = async (user: User & { email: string }, spaceId: string) => {
  console.log('######### signIn - Creating new user #########');
  await prisma.user.upsert({
    create: {
      spaceId,
      email: user.email,
      emailVerified: new Date(),
      authProvider: 'email',
      username: user.email,
      accounts: {
        create: {
          provider: 'custom-email',
          providerAccountId: user.email,
          type: 'credentials',
        },
      },
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
};
/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter).
 * At the end, it returns a redirect to the `verify-request` page.
 */
async function POST(req: NextRequest, res: NextResponse) {
  const reqBody = await req.json();
  const { spaceId, provider, email } = reqBody;

  console.log('######### send-verification - POST #########');
  console.log('request', JSON.stringify(reqBody));

  console.log('request', JSON.stringify(req.cookies.getAll()));

  const normalizer = defaultNormalizer;
  const userEmail = normalizer(email);

  const defaultUser = { id: crypto.randomUUID(), email: userEmail, emailVerified: null };
  const user = ((await prisma.user.findUnique({ where: { email_spaceId: { email: userEmail, spaceId } } })) ?? defaultUser) as User & { email: string };

  console.log('user', user);
  await createUser(user, spaceId);

  const token = randomString(32);

  const ONE_DAY_IN_SECONDS = 86400;
  const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000 * 30); // 30 days

  const secret = 'some-tidbitshub-secret';

  const headersList = headers();

  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const httpsProto = headersList.get('x-forwarded-proto');
  // Do whatever you want here, before the request is passed down to `NextAuth`

  const baseUrl = `${httpsProto}://${host}`;

  const url = `${baseUrl}/callback/custom-email?${new URLSearchParams({
    callbackUrl: `${baseUrl}/`,
    token,
    email: userEmail,
  })}`;
  console.log('url', url);
  const sendRequest = await sendVerificationRequest({
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
  const verificationToken = await prisma.verificationToken.create({ data });

  const aaa = {
    redirect: `${baseUrl}/verify-request?${new URLSearchParams({
      provider: 'custom-email',
      type: 'credentials',
    })}`,
  };
  return NextResponse.json({
    token,
  });
}

function defaultNormalizer(email?: string) {
  if (!email) throw new Error('Missing email from request body.');
  // Get the first two elements only,
  // separated by `@` from user input.
  let [local, domain] = email.toLowerCase().trim().split('@');
  // The part before "@" can contain a ","
  // but we remove it on the domain part
  domain = domain.split(',')[0];
  return `${local}@${domain}`;
}

export { POST };
