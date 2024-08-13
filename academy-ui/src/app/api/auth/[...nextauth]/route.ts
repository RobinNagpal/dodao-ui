export const dynamic = 'force-dynamic';

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);
