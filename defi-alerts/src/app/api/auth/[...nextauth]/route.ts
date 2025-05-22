import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export const GET = withErrorHandlingV2(handler);
export const POST = withErrorHandlingV2(handler);
