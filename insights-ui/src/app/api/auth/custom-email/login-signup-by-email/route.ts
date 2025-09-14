import { prisma } from '@/prisma';
import { createHash } from '@dodao/web-core/api/auth/createHash';
import { defaultNormalizer, randomString, sendVerificationRequest } from '@dodao/web-core/api/auth/custom-email/send-verification';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export interface LoginSignupByEmailRequestBody {
  spaceId: string;
  email: string;
  context: Contexts;
}

export interface LoginSignupByEmailResponse {
  // Empty response as the function returns an empty object
}

export interface ErrorResponse {
  error: string;
}

const createUser = async (user: { email: string }, spaceId: string) => {
  console.log('[login-signup-by-email] Creating new user:', {
    email: user.email,
    spaceId,
  });

  try {
    console.log('[login-signup-by-email] Upserting user in database');
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
    console.log('[login-signup-by-email] User upserted successfully:', {
      userId: upsertedUser.id,
      email: upsertedUser.email,
    });

    console.log('[login-signup-by-email] Upserting account for user');
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
    console.log('[login-signup-by-email] Account upserted successfully');
  } catch (error) {
    console.error('[login-signup-by-email] Error creating user:', error);
    await logError(
      'Error creating user in login-signup-by-email',
      {
        email: user.email,
        spaceId,
      },
      error as Error,
      spaceId
    );
    throw error;
  }
};
/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter).
 * At the end, it returns a redirect to the `verify-request` page.
 */
async function postHandler(req: NextRequest): Promise<LoginSignupByEmailResponse> {
  console.log('[login-signup-by-email] postHandler started');
  const reqBody = (await req.json()) as LoginSignupByEmailRequestBody;
  try {
    console.log('[login-signup-by-email] Parsing request body');
    console.log('[login-signup-by-email] Request body:', JSON.stringify(reqBody, null, 2));

    const { spaceId, email, context } = reqBody;
    console.log('[login-signup-by-email] Extracted parameters:', { spaceId, email, context });

    console.log('[login-signup-by-email] Request cookies:', JSON.stringify(req.cookies.getAll()));

    console.log('[login-signup-by-email] Normalizing email');
    const userEmail = defaultNormalizer(email);
    console.log('[login-signup-by-email] Normalized email:', userEmail);

    const defaultUser = { id: uuidv4(), email: userEmail, emailVerified: null };
    console.log('[login-signup-by-email] Created default user object with ID:', defaultUser.id);

    // We do this because we want to allow to login on TidbitsHub only using the email. If a user create a space
    // and then comes back to login via Tidbits hub, this flow will be invoked.
    console.log('[login-signup-by-email] Checking if user exists');
    let user;
    if (spaceId === PredefinedSpaces.TIDBITS_HUB) {
      console.log('[login-signup-by-email] Searching for user in TidbitsHub');
      user = await prisma.user.findFirst({ where: { email: userEmail } });
    } else {
      console.log('[login-signup-by-email] Searching for user in specific space:', spaceId);
      user = await prisma.user.findUnique({ where: { email_spaceId: { email: userEmail, spaceId } } });
    }

    console.log('[login-signup-by-email] User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('[login-signup-by-email] User not found, creating new user');
      await createUser(defaultUser, spaceId);
    } else {
      console.log('[login-signup-by-email] Using existing user:', {
        userId: user.id,
        email: user.email,
      });
    }

    console.log('[login-signup-by-email] Generating verification token');
    const token = randomString(32);
    console.log('[login-signup-by-email] Token generated (not shown for security)');

    const ONE_DAY_IN_SECONDS = 86400;
    const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000 * 30); // 30 days
    console.log('[login-signup-by-email] Token expiration set to:', expires);

    console.log('[login-signup-by-email] Getting headers for URL construction');
    const headersList = await headers();

    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    const httpsProto = headersList.get('x-forwarded-proto');
    console.log('[login-signup-by-email] Headers retrieved:', { host, httpsProto });

    const baseUrl = `${httpsProto}://${host}`;
    console.log('[login-signup-by-email] Base URL constructed:', baseUrl);

    const url = `${baseUrl}/auth/email/verify?${new URLSearchParams({
      token,
    })}&context=${context}`;
    console.log('[login-signup-by-email] Verification URL constructed (token hidden):', url.replace(token, '[TOKEN_HIDDEN]'));

    console.log('[login-signup-by-email] Sending verification email to:', userEmail);
    await sendVerificationRequest({
      identifier: userEmail,
      token,
      expires,
      url: url,
    });
    console.log('[login-signup-by-email] Verification email sent successfully');

    console.log('[login-signup-by-email] Creating hashed verification token in database');
    const data = {
      identifier: userEmail,
      token: await createHash(`${token}${process.env.EMAIL_TOKEN_SECRET!}`),
      expires,
    };
    await prisma.verificationToken.create({ data });
    console.log('[login-signup-by-email] Verification token created in database successfully');
  } catch (error) {
    console.error('[login-signup-by-email] Error in postHandler:', error);
    await logError(
      'Error in login-signup-by-email postHandler',
      {
        email: reqBody?.email,
        spaceId: reqBody?.spaceId,
        context: reqBody?.context,
      },
      error as Error,
      reqBody?.spaceId
    );
    throw error;
  }

  return {};
}

export const POST = withErrorHandlingV2<LoginSignupByEmailResponse>(postHandler);
