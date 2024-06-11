import { authorizeCrypto } from '@dodao/web-core/api/auth/authorizeCrypto';
import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { createHash } from '@dodao/web-core/api/auth/createHash';
import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AuthOptions, RequestInternal } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaUser } from '@dodao/web-core/api/auth/customPrismaAdapter';

const p = new PrismaClient();
// Configure AWS SES

export const authOptions: AuthOptions = getAuthOptions(p, authorizeCrypto);
