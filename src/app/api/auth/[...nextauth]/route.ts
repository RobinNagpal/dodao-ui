import { prisma } from '@/prisma';
import { User } from '@/types/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { ethers } from 'ethers';
import NextAuth, { AuthOptions, RequestInternal } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Authorization function for crypto login
//  takes publicAdress and signature from credentials and returns
//  either a user object on success or null on failure
async function authorizeCrypto(
  credentials: Record<'publicAddress' | 'signedNonce' | 'spaceId', string> | undefined,
  req: Pick<RequestInternal, 'body' | 'headers' | 'method' | 'query'>
) {
  if (!credentials) return null;

  const { publicAddress, signedNonce, spaceId } = credentials;

  // Get user from database with their generated nonce
  const user = await prisma.user.findUnique({
    where: { publicAddress_spaceId: { publicAddress, spaceId } },
    include: { cryptoLoginNonce: true },
  });

  if (!user?.cryptoLoginNonce) return null;

  // Compute the signer address from the saved nonce and the received signature
  const signerAddress = ethers.verifyMessage(user.cryptoLoginNonce.nonce, signedNonce);

  // Check that the signer address matches the public address
  //  that is trying to sign in
  if (signerAddress !== publicAddress) return null;

  // Check that the nonce is not expired
  if (user.cryptoLoginNonce.expires < new Date()) return null;

  // Everything is fine, clear the nonce and return the user
  await prisma.cryptoLoginNonce.delete({ where: { userId: user.id } });

  return {
    id: user.id,
    name: user.publicAddress,
    username: user.publicAddress,
    publicAddress: user.publicAddress,
  };
}

// see: https://next-auth.js.org/configuration/options
export const authOptions: AuthOptions = {
  // Setting error and signin pages to our /auth custom page
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // see: https://next-auth.js.org/configuration/providers/credentials
    CredentialsProvider({
      id: 'crypto',
      name: 'Crypto Wallet Auth',
      credentials: {
        publicAddress: { label: 'Public Address', type: 'text' },
        signedNonce: { label: 'Signed Nonce', type: 'text' },
        spaceId: { label: 'Space Id', type: 'text' },
      },
      authorize: authorizeCrypto,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  // Due to a NextAuth bug, the default database strategy is no usable
  //  with CredentialsProvider, so we need to set strategy to JWT
  session: {
    strategy: 'jwt',
  },
  // Setting secret here for convenience, do not use this in production
  secret: 'DO_NOT_USE_THIS_IN_PROD',
  callbacks: {
    async session({ session, user, token }) {
      let userInfo: any = {};
      if (token.sub) {
        const dbUser: User | null = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (dbUser) {
          userInfo.username = dbUser.username;
          userInfo.authProvider = dbUser.authProvider;
          userInfo.spaceId = dbUser.spaceId;
        }
      }
      return {
        ...session,
        ...userInfo,
      };
    },
    jwt: async ({ token, user, account, profile, isNewUser }) => {
      if (token.sub) {
        const dbUser: User | null = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (dbUser) {
          token.spaceId = dbUser.spaceId;
          token.username = dbUser.username;
          token.authProvider = dbUser.authProvider;
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
