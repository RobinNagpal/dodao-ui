import { createHash } from '@dodao/web-core/api/auth/createHash';
import { prisma } from '@/prisma';
import { SES } from '@aws-sdk/client-ses';
import { User } from 'next-auth/core/types';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ses = new SES({
  region: process.env.AWS_REGION,
});
/** Web compatible method to create a random string of a given length */
function randomString(size: number) {
  const i2hex = (i: number) => ('0' + i.toString(16)).slice(-2);
  const r = (a: string, i: number): string => a + i2hex(i);
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).reduce(r, '');
}

const emailBody = (link: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        a {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sign In to Your Account</h1>
        <p>Your sign-in link is below. Please click the button to proceed.</p>
        <a href="${decodeURIComponent(link)}">Sign In</a>
        <p>If you did not request this email, please ignore it.</p>
    </div>
</body>
</html>
`;

const sendVerificationRequest = async (params: { identifier: string; url: string; expires: Date; token: string }) => {
  const { identifier: email, url } = params;

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
            Data: emailBody(url),
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

  const headersList = headers();

  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const httpsProto = headersList.get('x-forwarded-proto');
  // Do whatever you want here, before the request is passed down to `NextAuth`

  const baseUrl = `${httpsProto}://${host}`;

  const url = `${baseUrl}/auth/email/verify?${new URLSearchParams({
    token,
  })}`;
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
